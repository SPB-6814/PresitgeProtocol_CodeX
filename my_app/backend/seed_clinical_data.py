import os
from dotenv import load_dotenv
from supabase import create_client, Client
import google.generativeai as genai

# Load .env from parent directory (my_app)
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

# Configuration
SUPABASE_URL = os.environ.get("NEXT_PUBLIC_SUPABASE_URL") or os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")

if not all([SUPABASE_URL, SUPABASE_KEY, GEMINI_API_KEY]):
    print("WARNING: Missing required environment variables. Please ensure your .env file has NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (or anon key), and GEMINI_API_KEY.")
    exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
genai.configure(api_key=GEMINI_API_KEY)

# 5 Common Veterinary Protocols
CLINICAL_PROTOCOLS = [
    {
        "condition_name": "Canine Parvovirus (CPV)",
        "symptoms_summary": "Severe lethargy, loss of appetite, profuse vomiting, and bloody diarrhea with a distinct foul odor. Often accompanied by fever and rapid dehydration.",
        "treatment_steps": "1. Immediate isolation. 2. Aggressive IV fluid therapy. 3. Anti-emetics (e.g., Maropitant) and broad-spectrum antibiotics to prevent secondary sepsis. 4. Nutritional support via feeding tube if anorexia persists.",
        "danger_signs": "Extreme lethargy, pale or dry mucous membranes, persistent vomiting rendering oral intake impossible, shock."
    },
    {
        "condition_name": "Feline Upper Respiratory Infection (URI)",
        "symptoms_summary": "Sneezing, nasal and ocular discharge (clear to purulent), conjunctivitis, fever, lethargy, and anorexia due to loss of smell.",
        "treatment_steps": "1. Keep face clean of discharge. 2. Encourage eating with warmed, strong-smelling wet food. 3. Use a humidifier. 4. Prescribe antiviral/antibiotic eye drops or systemic antibiotics if secondary bacterial infection is suspected.",
        "danger_signs": "Open-mouth breathing, severe anorexia lasting >24 hours, extreme lethargy, purulent discharge obstructing airways."
    },
    {
        "condition_name": "Dietary Indiscretion (Gastroenteritis)",
        "symptoms_summary": "Acute onset of vomiting and/or diarrhea after consuming inappropriate food, garbage, or sudden diet changes. Mild lethargy but usually alert.",
        "treatment_steps": "1. Fasting for 12-24 hours (adults only). 2. Gradual reintroduction of a bland diet (e.g., boiled chicken and white rice). 3. Provide access to small amounts of water frequently. 4. Probiotics.",
        "danger_signs": "Vomiting water immediately after drinking, projectile vomiting, bloated or tense abdomen (rule out GDV), blood in vomit or stool."
    },
    {
        "condition_name": "Gastric Dilatation-Volvulus (GDV / Bloat)",
        "symptoms_summary": "Restlessness, pacing, unproductive retching or gagging, hypersalivation, distended and tympanic (drum-like) abdomen, rapid heart rate.",
        "treatment_steps": "1. IMMEDIATE emergency veterinary intervention. 2. IV shock fluid therapy. 3. Gastric decompression (stomach tube or trocharization). 4. Emergency surgery (derotation and gastropexy).",
        "danger_signs": "Unproductive retching, visibly expanding stomach, collapse, pale gums, weak pulse. This is a life-threatening emergency."
    },
    {
        "condition_name": "Canine Infectious Tracheobronchitis (Kennel Cough)",
        "symptoms_summary": "Harsh, dry, 'honking' cough, often followed by retching or gagging. Usually preceded by exposure to other dogs (boarding, parks). Otherwise active and eating normally.",
        "treatment_steps": "1. Isolate from other dogs. 2. Use a harness instead of a collar to avoid tracheal irritation. 3. Cough suppressants if the cough is non-productive and exhausting. 4. Antibiotics only if fever or secondary pneumonia develops.",
        "danger_signs": "Productive cough (yellow/green phlegm), fever, lethargy, loss of appetite, difficulty breathing (labored respiratory effort)."
    }
]

def generate_embedding(text: str) -> list[float]:
    result = genai.embed_content(
        model="models/gemini-embedding-2", 
        content=text,
        task_type="retrieval_document",
        output_dimensionality=768
    )
    return result['embedding']

def seed_database():
    print("Starting clinical data seeding...")
    
    for protocol in CLINICAL_PROTOCOLS:
        print(f"Processing: {protocol['condition_name']}")
        
        # We embed the symptoms_summary since that's what user queries will match against
        embedding_text = f"Condition: {protocol['condition_name']}. Symptoms: {protocol['symptoms_summary']}"
        embedding = generate_embedding(embedding_text)
        
        data = {
            "condition_name": protocol["condition_name"],
            "symptoms_summary": protocol["symptoms_summary"],
            "treatment_steps": protocol["treatment_steps"],
            "danger_signs": protocol["danger_signs"],
            "embedding": embedding
        }
        
        try:
            response = supabase.table("clinical_knowledge").insert(data).execute()
            print(f"✅ Successfully inserted: {protocol['condition_name']}")
        except Exception as e:
            print(f"❌ Failed to insert {protocol['condition_name']}: {e}")

    print("Seeding complete!")

if __name__ == "__main__":
    seed_database()
