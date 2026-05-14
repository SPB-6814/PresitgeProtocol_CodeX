"""
AI Cat Mood Detector - FIXED VERSION
Using YOLOv8 for pose estimation
"""

import cv2
import math
import numpy as np
from flask import Flask, request, render_template_string, jsonify
import base64
import os
import tempfile
from ultralytics import YOLO

app = Flask(__name__)

class AICatMoodAnalyzer:
    def __init__(self):
        print("🚀 Loading YOLO AI Model...")
        try:
            # Load YOLO Pose model (nano version for speed)
            self.model = YOLO('yolov8n-pose.pt')
            print("✅ YOLO Model Loaded Successfully!")
        except Exception as e:
            print(f"⚠️ Error loading model: {e}")
            self.model = None
    
    def calculate_angle(self, a, b, c):
        """Calculate angle between three points"""
        if a is None or b is None or c is None:
            return None
        
        try:
            # Vector math
            ba = (a[0] - b[0], a[1] - b[1])
            bc = (c[0] - b[0], c[1] - b[1])
            
            dot_product = ba[0]*bc[0] + ba[1]*bc[1]
            magnitude_ba = math.sqrt(ba[0]**2 + ba[1]**2)
            magnitude_bc = math.sqrt(bc[0]**2 + bc[1]**2)
            
            if magnitude_ba == 0 or magnitude_bc == 0:
                return None
                
            cos_angle = dot_product / (magnitude_ba * magnitude_bc)
            cos_angle = max(-1, min(1, cos_angle))
            return math.degrees(math.acos(cos_angle))
        except:
            return None
    
    def analyze_mood(self, image_path):
        """Process image through YOLO and determine mood"""
        if self.model is None:
            return {"error": "AI Model not loaded properly"}
        
        try:
            # Run YOLO inference
            results = self.model(image_path, verbose=False)
            
            if len(results) == 0:
                return {"error": "No detection results"}
            
            result = results[0]
            
            # Check if keypoints were detected
            if result.keypoints is None or len(result.keypoints.xy) == 0:
                return {"error": "No cat keypoints detected. Try a clearer image with a visible cat."}
            
            # Get keypoints (17 COCO keypoints)
            keypoints = result.keypoints.xy.cpu().numpy()[0]
            
            # COCO keypoint indices:
            # 0: nose, 1: left_eye, 2: right_eye, 3: left_ear, 4: right_ear
            # 5: left_shoulder, 6: right_shoulder, 7: left_elbow, 8: right_elbow
            # 9: left_wrist, 10: right_wrist, 11: left_hip, 12: right_hip
            
            # Extract relevant points
            nose = keypoints[0] if len(keypoints) > 0 and keypoints[0][0] > 0 else None
            left_eye = keypoints[1] if len(keypoints) > 1 and keypoints[1][0] > 0 else None
            right_eye = keypoints[2] if len(keypoints) > 2 and keypoints[2][0] > 0 else None
            left_ear = keypoints[3] if len(keypoints) > 3 and keypoints[3][0] > 0 else None
            right_ear = keypoints[4] if len(keypoints) > 4 and keypoints[4][0] > 0 else None
            left_shoulder = keypoints[5] if len(keypoints) > 5 and keypoints[5][0] > 0 else None
            right_shoulder = keypoints[6] if len(keypoints) > 6 and keypoints[6][0] > 0 else None
            left_hip = keypoints[11] if len(keypoints) > 11 and keypoints[11][0] > 0 else None
            right_hip = keypoints[12] if len(keypoints) > 12 and keypoints[12][0] > 0 else None
            
            # Check if enough points were detected
            detected_points = sum(1 for p in [nose, left_ear, right_ear, left_shoulder, right_shoulder] if p is not None)
            if detected_points < 3:
                return {"error": f"Only {detected_points}/5 keypoints detected. Need clearer cat photo."}
            
            # --- Feature Extraction ---
            features = {}
            
            # 1. Ear Spread (Alert vs Relaxed)
            ear_spread = None
            if left_ear is not None and right_ear is not None and nose is not None:
                ear_distance = math.sqrt((left_ear[0]-right_ear[0])**2 + (left_ear[1]-right_ear[1])**2)
                nose_center_dist = abs(nose[0] - (left_ear[0]+right_ear[0])/2)
                ear_spread = ear_distance / (nose_center_dist + 0.01)
                features['ear_spread'] = round(ear_spread, 2)
            
            # 2. Head Tilt (Friendliness)
            head_tilt = None
            if left_ear is not None and right_ear is not None:
                head_tilt = math.degrees(math.atan2(right_ear[1]-left_ear[1], right_ear[0]-left_ear[0]))
                features['head_tilt'] = round(abs(head_tilt), 1)
            
            # 3. Back Arch (Threatened posture)
            back_arch = None
            if left_shoulder is not None and left_hip is not None:
                shoulder_hip_y_diff = left_hip[1] - left_shoulder[1]
                back_arch = shoulder_hip_y_diff
                features['back_arch'] = round(back_arch, 1)
            
            # 4. Body Stretch (Relaxed vs Hunting)
            body_stretch = None
            if left_shoulder is not None and left_hip is not None:
                body_stretch = math.sqrt((left_hip[0]-left_shoulder[0])**2 + (left_hip[1]-left_shoulder[1])**2)
                features['body_stretch'] = round(body_stretch, 1)
            
            # 5. Head Height (Alertness)
            head_height = None
            if left_ear is not None and left_shoulder is not None:
                head_height = left_ear[1] - left_shoulder[1]
                features['head_height'] = round(head_height, 1)
            
            # --- Mood Classification ---
            scores = {"Friendly": 0, "Alert": 0, "Threatened": 0, "Hunting": 0, "Relaxed": 0}
            
            # FRIENDLY: Moderate ear spread, slight head tilt
            if ear_spread and 0.8 < ear_spread < 1.5:
                scores["Friendly"] += 30
            if head_tilt and abs(head_tilt) < 15:
                scores["Friendly"] += 25
            if body_stretch and body_stretch > 100:
                scores["Friendly"] += 20
            
            # ALERT: Wide ear spread, elevated head
            if ear_spread and ear_spread > 1.5:
                scores["Alert"] += 40
            if head_height and head_height < -30:  # Negative means head above shoulders
                scores["Alert"] += 30
            if head_tilt and abs(head_tilt) > 10:
                scores["Alert"] += 20
            
            # THREATENED: Arched back (shoulder much lower than hips), pinned ears
            if back_arch and back_arch < -20:  # Negative arch means hips higher
                scores["Threatened"] += 40
            if ear_spread and ear_spread < 0.7:
                scores["Threatened"] += 30
            if body_stretch and body_stretch < 80:
                scores["Threatened"] += 20
            
            # HUNTING: Low body stretch (crouched), level back
            if body_stretch and body_stretch < 90:
                scores["Hunting"] += 35
            if back_arch and -10 < back_arch < 10:
                scores["Hunting"] += 30
            if ear_spread and 1.0 < ear_spread < 1.6:
                scores["Hunting"] += 25
            
            # RELAXED: Neutral ear spread, normal body stretch
            if ear_spread and 0.9 < ear_spread < 1.3:
                scores["Relaxed"] += 35
            if body_stretch and 100 < body_stretch < 150:
                scores["Relaxed"] += 30
            if head_tilt and abs(head_tilt) < 10:
                scores["Relaxed"] += 25
            
            # Find primary mood
            primary_mood = max(scores, key=scores.get)
            confidence = scores[primary_mood]
            
            # Feedback messages
            feedback = {
                "Friendly": ["😊 Friendly posture detected!", "Relaxed ears and slight head tilt"],
                "Alert": ["👀 Cat is alert and attentive!", "Ears are spread wide, head elevated"],
                "Threatened": ["😰 Threatened posture detected!", "Arched back suggests fear or discomfort"],
                "Hunting": ["🎯 Hunting/stalking posture!", "Crouched position, ready to pounce"],
                "Relaxed": ["😌 Cat is relaxed and comfortable!", "Neutral body language detected"]
            }
            
            return {
                "mood": primary_mood,
                "confidence": min(100, confidence),
                "scores": scores,
                "features": features,
                "feedback": feedback.get(primary_mood, ["Analysis complete"]),
                "keypoints_detected": detected_points
            }
            
        except Exception as e:
            return {"error": f"Analysis error: {str(e)}"}

# Initialize analyzer
print("=" * 50)
print("🐱 AI CAT MOOD DETECTOR")
print("=" * 50)
analyzer = AICatMoodAnalyzer()

# HTML Template
HTML_TEMPLATE = """
<!DOCTYPE html>
<html>
<head>
    <title>AI Cat Mood Detector - YOLO Pose Analysis</title>
    <style>
        body { font-family: 'Segoe UI', Arial; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); margin: 0; padding: 20px; min-height: 100vh; }
        .container { max-width: 1000px; margin: auto; background: white; border-radius: 20px; padding: 30px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
        h1 { text-align: center; color: #FF6B35; }
        .subtitle { text-align: center; color: #666; margin-bottom: 30px; }
        .upload-area { border: 3px dashed #FF6B35; border-radius: 15px; padding: 40px; text-align: center; background: #FFF8F0; cursor: pointer; transition: all 0.3s; margin: 20px 0; }
        .upload-area:hover { background: #FFF0E0; border-color: #E55A20; }
        button { background: #FF6B35; color: white; padding: 12px 30px; border: none; border-radius: 8px; font-size: 16px; cursor: pointer; margin: 20px 0; transition: transform 0.2s; }
        button:hover { transform: scale(1.05); background: #E55A20; }
        .result-card { margin-top: 20px; padding: 20px; border-radius: 15px; display: none; }
        .mood-friendly { background: #C8E6C9; border-left: 10px solid #4CAF50; }
        .mood-alert { background: #FFE0B2; border-left: 10px solid #FF9800; }
        .mood-threatened { background: #FFCDD2; border-left: 10px solid #F44336; }
        .mood-hunting { background: #B3E5FC; border-left: 10px solid #2196F3; }
        .mood-relaxed { background: #E8EAF6; border-left: 10px solid #9C27B0; }
        .mood-title { font-size: 48px; font-weight: bold; text-align: center; }
        .confidence { font-size: 18px; text-align: center; margin: 10px 0; }
        .score-bar { height: 30px; background: #e0e0e0; border-radius: 15px; overflow: hidden; margin: 10px 0; }
        .score-fill { height: 100%; transition: width 0.5s; display: flex; align-items: center; justify-content: flex-end; padding-right: 10px; color: white; font-weight: bold; }
        .preview-img { max-width: 100%; border-radius: 10px; margin: 20px 0; box-shadow: 0 5px 20px rgba(0,0,0,0.2); display: none; }
        .feature-list { list-style: none; padding: 0; }
        .feature-list li { padding: 8px 0; border-bottom: 1px solid #ddd; }
        .loading { text-align: center; display: none; padding: 20px; }
        .info-box { background: #E3F2FD; padding: 15px; border-radius: 10px; margin-top: 20px; font-size: 14px; }
        .badge { background: #FF6B35; color: white; padding: 3px 8px; border-radius: 12px; font-size: 11px; display: inline-block; margin-left: 5px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🐱 AI Cat Mood Detector</h1>
        <div class="subtitle">Powered by YOLOv8 Pose Estimation | Automatic Keypoint Detection</div>
        
        <div class="upload-area" onclick="document.getElementById('imageInput').click()">
            <input type="file" id="imageInput" accept="image/*" style="display: none">
            <p>📸 Click to upload cat photo</p>
            <p style="font-size: 12px; color: #666">Supports: JPG, PNG, JPEG</p>
        </div>
        
        <div style="text-align: center">
            <button onclick="analyzeImage()">🔍 Analyze Mood with AI</button>
        </div>
        
        <img id="preview" class="preview-img" alt="Preview">
        
        <div class="loading" id="loading">
            <p>🧠 AI is analyzing your cat's body language...</p>
            <p style="font-size: 12px">Detecting keypoints: ears, nose, shoulders, hips</p>
        </div>
        
        <div id="result"></div>
        
        <div class="info-box">
            <strong>🤖 How the AI works:</strong><br>
            • <strong>YOLOv8</strong> detects 17 keypoints on your cat (nose, ears, eyes, shoulders, hips)<br>
            • <strong>Geometry engine</strong> calculates ear spread, head tilt, and back arch from the keypoints<br>
            • <strong>Classification logic</strong> determines mood based on body language science<br>
            <br>
            <strong>Moods detected:</strong> 😊 Friendly | 👀 Alert | 😰 Threatened | 🎯 Hunting | 😌 Relaxed
        </div>
    </div>
    
    <script>
        let currentImageData = null;
        
        document.getElementById('imageInput').onchange = function(e) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = function(event) {
                currentImageData = event.target.result.split(',')[1];
                document.getElementById('preview').src = event.target.result;
                document.getElementById('preview').style.display = 'block';
                document.getElementById('result').innerHTML = '';
            };
            reader.readAsDataURL(file);
        };
        
        async function analyzeImage() {
            if (!currentImageData) {
                alert('Please select a cat photo first');
                return;
            }
            
            document.getElementById('loading').style.display = 'block';
            document.getElementById('result').style.display = 'none';
            
            try {
                const response = await fetch('/analyze', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({image: currentImageData})
                });
                
                const data = await response.json();
                document.getElementById('loading').style.display = 'none';
                
                if (data.error) {
                    alert('Error: ' + data.error);
                    return;
                }
                
                const moodClass = data.mood.toLowerCase();
                const colors = {'Friendly': '#4CAF50', 'Alert': '#FF9800', 'Threatened': '#F44336', 'Hunting': '#2196F3', 'Relaxed': '#9C27B0'};
                
                let featuresHtml = '';
                for (const [feature, value] of Object.entries(data.features)) {
                    featuresHtml += `<li>✓ ${feature.replace(/_/g, ' ')}: ${value}</li>`;
                }
                
                document.getElementById('result').innerHTML = `
                    <div class="result-card mood-${moodClass}" style="display:block">
                        <div class="mood-title">
                            ${data.mood === 'Friendly' ? '😊' : data.mood === 'Alert' ? '👀' : data.mood === 'Threatened' ? '😰' : data.mood === 'Hunting' ? '🎯' : '😌'} 
                            ${data.mood}
                        </div>
                        <div class="confidence">Confidence: ${data.confidence}%</div>
                        
                        <h3>📊 Mood Scores:</h3>
                        ${Object.entries(data.scores).map(([mood, score]) => `
                            <div>${mood}</div>
                            <div class="score-bar">
                                <div class="score-fill" style="width: ${score}%; background: ${mood === data.mood ? colors[mood] : '#999'}">${score}%</div>
                            </div>
                        `).join('')}
                        
                        <h3>🔍 AI-Detected Features:</h3>
                        <ul class="feature-list">
                            ${featuresHtml || '<li>Features being analyzed...</li>'}
                            <li>✓ Keypoints detected: ${data.keypoints_detected || '?'}/5</li>
                        </ul>
                        
                        <h3>💡 Mood Analysis:</h3>
                        <ul>
                            ${data.feedback.map(f => `<li>${f}</li>`).join('')}
                        </ul>
                    </div>
                `;
                document.getElementById('result').style.display = 'block';
            } catch (error) {
                document.getElementById('loading').style.display = 'none';
                alert('Connection error: ' + error.message);
            }
        }
    </script>
</body>
</html>
"""

@app.route('/')
def index():
    return render_template_string(HTML_TEMPLATE)

@app.route('/analyze', methods=['POST'])
def analyze():
    try:
        data = request.json
        if not data or 'image' not in data:
            return jsonify({"error": "No image data received"}), 400
        
        image_data = data['image']
        
        # Decode base64 image
        try:
            img_bytes = base64.b64decode(image_data)
            np_arr = np.frombuffer(img_bytes, np.uint8)
            img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
            
            if img is None:
                return jsonify({"error": "Could not decode image"}), 400
        except Exception as e:
            return jsonify({"error": f"Image decoding error: {str(e)}"}), 400
        
        # Save temporary file
        temp_path = None
        try:
            with tempfile.NamedTemporaryFile(suffix='.jpg', delete=False) as tmp:
                temp_path = tmp.name
                cv2.imwrite(temp_path, img)
            
            # Analyze with AI
            result = analyzer.analyze_mood(temp_path)
            
            return jsonify(result)
            
        except Exception as e:
            return jsonify({"error": f"Analysis error: {str(e)}"}), 500
        finally:
            # Cleanup temp file
            if temp_path and os.path.exists(temp_path):
                try:
                    os.unlink(temp_path)
                except:
                    pass
        
    except Exception as e:
        return jsonify({"error": f"Server error: {str(e)}"}), 500

if __name__ == '__main__':
    print("\n" + "=" * 50)
    print("🐱 AI CAT MOOD DETECTOR - READY!")
    print("=" * 50)
    print("\n🌐 Open in browser: http://localhost:5000")
    print("\n⚠️  First time running? It will download the YOLO model (~6MB)")
    print("   This happens once and then is cached.\n")
    app.run(debug=True, host='0.0.0.0', port=5000)