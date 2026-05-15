from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional, List
import os
import json
from dotenv import load_dotenv
from supabase import create_client, Client
import google.generativeai as genai

# Load .env from parent directory (my_app)
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

# ==============================================================================
# 1. Configuration & Initialization
# ==============================================================================
# Make sure to set these environment variables before running the server
SUPABASE_URL = os.environ.get("NEXT_PUBLIC_SUPABASE_URL") or os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")

if not all([SUPABASE_URL, SUPABASE_KEY, GEMINI_API_KEY]):
    print("WARNING: Missing required environment variables. Ensure NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and GEMINI_API_KEY are set.")

# Initialize Supabase (Using Service Role Key to bypass RLS for embedding matches)
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY) if SUPABASE_URL and SUPABASE_KEY else None

# Initialize Google Gemini
genai.configure(api_key=GEMINI_API_KEY)
llm_model = genai.GenerativeModel("gemini-flash-latest") # Using latest flash model

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="PawSense Triage API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For development. Limit to localhost:3000 in production.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==============================================================================
# 2. Pydantic Models
# ==============================================================================
class TriageRequest(BaseModel):
    symptoms: str
    region: Optional[str] = None # Optional region filter for community trends

class TriageResponse(BaseModel):
    clinical_matches: list
    community_matches: list

class AssessSymptomsRequest(BaseModel):
    symptoms: str
    breed: Optional[str] = "Unknown"
    age: Optional[str] = "Unknown"
    region: Optional[str] = None

class AssessSymptomsResponse(BaseModel):
    severity: str
    clinical_assessment: str
    community_alert: str
    actionable_steps: List[str]

class PetInsightsRequest(BaseModel):
    name: str
    animal_type: str
    breed: str
    age: str
    weight: float
    location: str
    vaccination_status: str
    diet: List[str]
    diet_status: str

class PetInsightsResponse(BaseModel):
    grooming_plan: str
    health_plan: str
    monthly_schedule: dict

# ==============================================================================
# 3. Embedding Helper
# ==============================================================================
def generate_embedding(text: str) -> list[float]:
    """Generates a 768-dimensional embedding using Google Gemini."""
    try:
        result = genai.embed_content(
            model="models/gemini-embedding-2", 
            content=text,
            task_type="retrieval_query",
            output_dimensionality=768
        )
        return result['embedding']
    except Exception as e:
        print(f"Error generating embedding: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate embedding.")

# ==============================================================================
# 4. API Routes
# ==============================================================================
@app.post("/api/triage", response_model=TriageResponse)
async def perform_triage(request: TriageRequest):
    # Legacy raw output endpoint
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase client not initialized.")
        
    query_embedding = generate_embedding(request.symptoms)
    
    # Query Clinical Ground Truth
    try:
        clinical_response = supabase.rpc("match_clinical_data", {
            "query_embedding": query_embedding,
            "match_threshold": 0.75,
            "match_count": 3
        }).execute()
    except Exception as e:
        print(f"Clinical DB error: {e}")
        clinical_response = type('obj', (object,), {'data': []})

    # Query Community Context
    try:
        community_response = supabase.rpc("match_community_trends", {
            "query_embedding": query_embedding,
            "match_threshold": 0.65,
            "match_count": 5,
            "filter_region": request.region
        }).execute()
    except Exception as e:
        print(f"Community DB error: {e}")
        community_response = type('obj', (object,), {'data': []})
    
    return {
        "clinical_matches": getattr(clinical_response, 'data', []),
        "community_matches": getattr(community_response, 'data', [])
    }

@app.post("/api/assess-symptoms", response_model=AssessSymptomsResponse)
async def assess_symptoms_with_llm(request: AssessSymptomsRequest):
    # Dual-Retrieval RAG endpoint with Gemini Synthesis
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase client not initialized.")
        
    # 1. Generate Embedding
    query_text = f"Breed: {request.breed}. Age: {request.age}. Symptoms: {request.symptoms}"
    query_embedding = generate_embedding(query_text)
    
    # 2. Dual Retrieval
    try:
        clinical_data = supabase.rpc("match_clinical_data", {
            "query_embedding": query_embedding,
            "match_threshold": 0.70,
            "match_count": 3
        }).execute().data
    except Exception as e:
        print(f"Clinical DB error: {e}")
        clinical_data = []

    try:
        community_data = supabase.rpc("match_community_trends", {
            "query_embedding": query_embedding,
            "match_threshold": 0.60,
            "match_count": 3,
            "filter_region": request.region
        }).execute().data
    except Exception as e:
        print(f"Community DB error: {e}")
        community_data = []

    # 3. Handle Community Edge Case
    community_context = ""
    if not community_data:
        community_context = "No recent local community trends reported for these symptoms."
    else:
        community_context = json.dumps(community_data, indent=2)

    clinical_context = json.dumps(clinical_data, indent=2) if clinical_data else "No specific matching protocol found. Rely on general veterinary knowledge."

    # 4. LLM Synthesis
    prompt = f"""You are a Lead Veterinary Triage Assistant. 
Analyze the following user input, retrieved clinical ground truth, and community context to produce a structured JSON triage report.

User Input:
Breed: {request.breed}
Age: {request.age}
Symptoms: {request.symptoms}

Retrieved Clinical Knowledge:
{clinical_context}

Retrieved Community Context:
{community_context}

Instructions:
1. Synthesize the clinical knowledge and your general veterinary knowledge to provide a safe, clear 'clinical_assessment'.
2. Provide a 'community_alert' summarizing the community context, or a default safe message if there are no trends.
3. Classify the 'severity' as exactly one of: Low, Moderate, High, Critical.
4. List 'actionable_steps' for the owner to take immediately.

Output strictly valid JSON with this exact schema:
{{
  "severity": "Low|Moderate|High|Critical",
  "clinical_assessment": "string",
  "community_alert": "string",
  "actionable_steps": ["string", "string"]
}}
"""
    
    try:
        response = llm_model.generate_content(
            prompt,
            generation_config={"response_mime_type": "application/json"}
        )
        # Parse the JSON string returned by Gemini
        text = response.text
        if text.startswith("```json"):
            text = text[7:]
        elif text.startswith("```"):
            text = text[3:]
        if text.endswith("```"):
            text = text[:-3]
        parsed_result = json.loads(text.strip())
        return parsed_result
    except Exception as e:
        print(f"LLM Synthesis failed: {e}")
        raise HTTPException(status_code=500, detail="AI Synthesis failed. Please try again later.")

@app.post("/api/generate-pet-insights")
async def generate_pet_insights(request: PetInsightsRequest):
    prompt = f"""You are an expert veterinarian and professional pet groomer.
Given the following details about a pet:
Name: {request.name}
Type: {request.animal_type}
Breed: {request.breed}
Age: {request.age}
Weight: {request.weight}kg
Location: {request.location}
Vaccination Status: {request.vaccination_status}
Diet: {', '.join(request.diet)}
Diet Notes: {request.diet_status}

Please generate a highly personalized, structured care plan.
Return a valid JSON object matching exactly this schema:
{{
  "health_plan": "<string: 2-3 paragraphs of breed-specific and age-specific health advice>",
  "grooming_plan": "<string: 2-3 paragraphs of specific grooming advice for this breed/type>",
  "monthly_schedule": {{
    "1": [{{"type": "health", "title": "Check Weight", "desc": "Monitor weight"}}],
    "15": [{{"type": "grooming", "title": "Nail Trim", "desc": "Clip nails to avoid overgrowth"}}]
  }}
}}
The `monthly_schedule` should contain keys from "1" to "30" representing days of the month. You do not need an event for every single day, but provide at least 5-10 meaningful events spread throughout the month (e.g., weekly brushing, monthly heartworm preventative, daily teeth brushing). The `type` must be either "health" or "grooming".
"""
    try:
        response = llm_model.generate_content(
            prompt,
            generation_config={"response_mime_type": "application/json"}
        )
        text = response.text
        if text.startswith("```json"):
            text = text[7:]
        elif text.startswith("```"):
            text = text[3:]
        if text.endswith("```"):
            text = text[:-3]
        parsed_result = json.loads(text.strip())
        return parsed_result
    except Exception as e:
        print(f"Pet Insights generation failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate pet insights.")

# To run: uvicorn main:app --reload --port 8000
