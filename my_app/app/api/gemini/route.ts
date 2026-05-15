import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { type, payload } = await request.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Gemini API key is missing. Please add GEMINI_API_KEY to your .env file.' },
        { status: 500 }
      );
    }

    let prompt = "";
    let contents: any[] = [];

    if (type === 'image') {
      const { base64Image } = payload;
      prompt = `You are a veterinary AI assistant. Analyze this image of a pet's physical condition. 
Provide a realistic, highly empathetic, and professional assessment.
Return ONLY a raw JSON object (no markdown formatting, no code blocks) with the following structure:
{
  "status": "healthy" | "warning" | "alert",
  "message": "A detailed, empathetic description of what you observe.",
  "possible_causes": ["Cause 1", "Cause 2"],
  "actionable_steps": ["Step 1", "Step 2", "Step 3"]
}`;

      contents = [
        {
          parts: [
            { text: prompt },
            {
              inline_data: {
                mime_type: "image/jpeg",
                data: base64Image
              }
            }
          ]
        }
      ];
    } else if (type === 'text') {
      const { symptoms, breed, age } = payload;
      prompt = `You are a veterinary AI assistant. Assess the following pet condition based on user input.
Breed: ${breed || 'Unknown'}
Age: ${age || 'Unknown'}
Symptoms: ${symptoms}

Return ONLY a raw JSON object (no markdown formatting, no code blocks) with the following structure:
{
  "severity": "Critical" | "High" | "Moderate" | "Low",
  "clinical_assessment": "A clear, professional assessment of the symptoms.",
  "community_alert": "Provide a hypothetical but realistic community alert or state no alerts.",
  "actionable_steps": ["Step 1", "Step 2", "Step 3"]
}`;

      contents = [
        {
          parts: [
            { text: prompt }
          ]
        }
      ];
    } else if (type === 'pet_profile') {
      const { name, animal_type, breed, age, weight, location, vaccination_status, diet, diet_status } = payload;
      prompt = `You are an expert veterinary AI. Create a personalized health and grooming plan for this pet based on the profile provided.
Name: ${name}
Type: ${animal_type}
Breed: ${breed}
Age: ${age}
Weight: ${weight}kg
Location: ${location}
Vaccination Status: ${vaccination_status}
Diet: ${diet.join(', ')}
Diet Notes: ${diet_status}

Return ONLY a raw JSON object (no markdown formatting, no code blocks) with the following structure:
{
  "health_plan": "A detailed, empathetic general health plan (can use basic HTML tags like <ul>, <li>, <strong> for formatting).",
  "grooming_plan": "A detailed, practical grooming plan (can use basic HTML tags for formatting)."
}`;

      contents = [
        {
          parts: [
            { text: prompt }
          ]
        }
      ];
    } else {
      return NextResponse.json({ error: 'Invalid payload type' }, { status: 400 });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          generationConfig: {
            response_mime_type: "application/json",
          }
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini API Error:", data);
      return NextResponse.json(
        { error: 'Failed to generate content from Gemini API.' },
        { status: 500 }
      );
    }

    const aiResponseText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!aiResponseText) {
      throw new Error("Invalid response structure from Gemini API");
    }

    // Parse the JSON string from Gemini into an object
    const aiResponseObj = JSON.parse(aiResponseText);
    return NextResponse.json(aiResponseObj);

  } catch (error) {
    console.error('Error in Gemini route:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred during processing.' },
      { status: 500 }
    );
  }
}
