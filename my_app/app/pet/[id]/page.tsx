import { Metadata, ResolvingMetadata } from 'next';
import { PETS_DATA } from '@/lib/data';
import PetDetail from '@/components/PetDetail';
import { notFound } from 'next/navigation';

type Props = {
  params: Promise<{ id: string }> | { id: string }
};

export async function generateMetadata(
  props: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const params = await props.params;
  const id = params.id;
  const pet = PETS_DATA.find(p => p.id === id);

  if (!pet) {
    return {
      title: 'Pet Not Found | PawSense'
    };
  }

  const name = pet.name || pet.petName;
  const description = pet.bio || pet.issue || `Check out ${name} on PawSense!`;
  
  // Use a fallback image if no image is present (though all mock data has an image)
  const imageUrl = pet.image;

  return {
    title: `${name} | PawSense`,
    description,
    openGraph: {
      title: `${name} | PawSense`,
      description,
      images: [
        {
          url: imageUrl,
          width: 800,
          height: 600,
          alt: `${name} on PawSense`,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${name} | PawSense`,
      description,
      images: [imageUrl],
    },
  };
}

export default async function PetPage(props: Props) {
  const params = await props.params;
  const pet = PETS_DATA.find(p => p.id === params.id);

  if (!pet) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      <PetDetail pet={pet} standalone={true} />
    </div>
  );
}
