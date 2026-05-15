import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function POST(request: Request) {
  try {
    const petData = await request.json();

    const prompt = `
      As an expert pet nutritionist and groomer, generate a comprehensive 7-day health and grooming plan for the following pet:
      Name: ${petData.name}
      Type: ${petData.animal_type}
      Breed: ${petData.breed}
      Gender: ${petData.gender}
      Age: ${petData.age}
      Weight: ${petData.weight}kg
      Vaccination Status: ${petData.vaccination_status}
      Diet: ${petData.diet?.join(", ") || "Standard"}
      Diet Status: ${petData.diet_status}

      Please provide:
      1. A detailed Daily Health & Nutrition Plan (including specific meal suggestions and exercise).
      2. A Weekly Grooming Plan tailored to their breed and type.
      
      Format the output clearly in Markdown. Ensure it is personalized for ${petData.name}.
    `;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
    });
    
    return NextResponse.json({ plan: response.text });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
