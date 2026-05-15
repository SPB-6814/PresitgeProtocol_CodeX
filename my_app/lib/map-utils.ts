import { supabase } from "./supabase";

export async function fetchMapEntities(lat: number, lng: number, radiusMeters: number = 500000) {
  let mappedEntities: any[] = [];

  // 1. Fetch from RPC
  const { data: rpcData, error: rpcError } = await supabase.rpc('get_entities_in_radius', {
    user_lat: lat,
    user_lng: lng,
    radius_meters: radiusMeters
  });

  if (!rpcError && rpcData) {
    mappedEntities = [...rpcData];
  } else {
    // Fallback for Strays and Map Points
    const { data: strays } = await supabase.from('stray_animals').select('*');
    const { data: points } = await supabase.from('map_points').select('*');

    mappedEntities = [
      ...(strays || []).map(s => {
        let sLng = 0, sLat = 0;
        if (!s.location) return null;
        if (typeof s.location === 'object' && s.location.coordinates) {
          sLng = s.location.coordinates[0]; sLat = s.location.coordinates[1];
        } else if (typeof s.location === 'string') {
          const match = s.location.match(/POINT\(([-\d.]+) ([-\d.]+)\)/i);
          if (!match) return null;
          sLng = parseFloat(match[1]); sLat = parseFloat(match[2]);
        }
        return {
          id: s.id, type: 'stray', name: s.name || `Stray ${s.animal_type}`, 
          description: s.description, animal_type: s.animal_type, 
          behavior_tags: s.behavior_tags, image_url: s.main_image_url, lng: sLng, lat: sLat
        };
      }),
      ...(points || []).map(p => {
        let pLng = 0, pLat = 0;
        if (!p.location) return null;
        if (typeof p.location === 'object' && p.location.coordinates) {
          pLng = p.location.coordinates[0]; pLat = p.location.coordinates[1];
        } else if (typeof p.location === 'string') {
          const match = p.location.match(/POINT\(([-\d.]+) ([-\d.]+)\)/i);
          if (!match) return null;
          pLng = parseFloat(match[1]); pLat = parseFloat(match[2]);
        }
        return {
          id: p.id, type: p.type, name: p.name, description: p.address, lng: pLng, lat: pLat
        };
      })
    ].filter(Boolean);
  }

  // 2. Fetch User Posts with locations
  const { data: userPostsData } = await supabase
    .from('posts')
    .select('*, profiles(display_name, avatar_url)')
    .not('lat', 'is', null)
    .not('lng', 'is', null);

  if (userPostsData) {
    const postEntities = userPostsData.map(post => ({
      id: post.id,
      type: 'post',
      name: post.profiles?.display_name || "User Post",
      description: post.caption,
      image_url: post.image_url,
      location_name: post.location,
      lat: post.lat,
      lng: post.lng,
      post_data: post
    }));
    mappedEntities = [...mappedEntities, ...postEntities];
  }

  // Final Distance Filter for fallback (if RPC failed, fallback fetched ALL entities. We must filter them manually)
  if (rpcError) {
    mappedEntities = mappedEntities.filter(entity => {
      if (entity.lat && entity.lng) {
        const dist = getDistanceFromLatLonInKm(lat, lng, entity.lat, entity.lng) * 1000;
        return dist <= radiusMeters;
      }
      return true;
    });
  }

  return mappedEntities;
}

function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);  
  var dLon = deg2rad(lon2-lon1); 
  var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c; // Distance in km
  return d;
}

function deg2rad(deg: number) {
  return deg * (Math.PI/180)
}
