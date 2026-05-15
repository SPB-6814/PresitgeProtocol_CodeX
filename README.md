# PawSense | Intelligent Animal Welfare

**PawSense** is a comprehensive, AI-powered animal welfare platform and companion care ecosystem. It connects pet owners, animal lovers, and NGOs to create a safer and healthier environment for animals.

## 🌟 Key Features

### 1. Community & Rescue Platform (Next.js Frontend)
A modern web application built with Next.js, Tailwind CSS, and Supabase.
- **Rescue Map**: Interactive map (powered by Leaflet) to drop and view pins for animal rescue operations.
- **Home Feed**: Stay updated with community posts, rescue stories, and pet adoptions.
- **Wellness & Calendar**: Track your pet's wellness journey and schedule appointments.
- **NGO Dashboard**: Specialized interface for NGOs to manage operations and coordinate with the community.
- **Secure Authentication**: User and NGO login flows managed by Supabase.

### 2. AI Cat Mood Detector (Computer Vision Backend)
A specialized Flask-based application utilizing YOLOv8 pose estimation to analyze feline body language.
- **Keypoint Detection**: Identifies 17 anatomical keypoints (ears, nose, shoulders, hips, etc.).
- **Mood Analysis**: Uses geometric calculations (ear spread, head tilt, back arch, body stretch) to determine a cat's mood.
- **Categories**: Classifies behavior into 5 distinct moods: 😊 Friendly, 👀 Alert, 😰 Threatened, 🎯 Hunting, and 😌 Relaxed.

## 🛠️ Tech Stack

### Frontend (`/my_app`)
- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Styling**: Tailwind CSS, Shadcn UI
- **Maps**: Leaflet (`react-leaflet`)
- **Backend/Auth**: Supabase
- **Icons**: Lucide React

### AI / Computer Vision (`/pet-wellness-cv`)
- **Backend**: Flask
- **AI/ML**: Ultralytics YOLOv8 (Pose Estimation), OpenCV, MediaPipe
- **Data Processing**: NumPy

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Python (3.8+)
- A Supabase Project (for frontend auth/database)

### 1. Running the Next.js Frontend
Navigate to the `my_app` directory:
```bash
cd my_app
```

Install dependencies:
```bash
npm install
```

Set up your `.env` file with Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Start the development server:
```bash
npm run dev
```
The app will be available at `http://localhost:3000`.

### 2. Running the AI Mood Detector
Navigate to the `pet-wellness-cv` directory:
```bash
cd pet-wellness-cv
```

Install Python dependencies:
```bash
pip install -r requirements.txt
```

Run the Flask server:
```bash
python app.py
```
The AI server will download the YOLOv8 nano model on the first run and will be available at `http://localhost:5000`.

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License
This project is licensed under the MIT License.
