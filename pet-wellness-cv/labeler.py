"""
COMPLETE CAT BODY LANGUAGE MOOD CLASSIFIER
Detects: Friendly, Alert, Threatened, Hunting, Relaxed
Based on geometric analysis of 20 keypoints
"""

import cv2
import numpy as np
from flask import Flask, request, render_template_string, jsonify
import os
import json
import base64
import math

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024

class CatMoodClassifier:
    def __init__(self, keypoints_file="keypoints.json"):
        """Load reference keypoints"""
        self.keypoints_names = [
            "nose", "left_ear_tip", "right_ear_tip", "left_ear_base", "right_ear_base",
            "neck_base", "spine_mid", "spine_lower", "tail_base", "tail_mid",
            "tail_tip", "left_shoulder", "right_shoulder", "left_front_paw",
            "right_front_paw", "left_hip", "right_hip", "left_back_paw",
            "right_back_paw", "head_top"
        ]
        
        # Load reference points if exists
        self.reference_points = None
        if os.path.exists(keypoints_file):
            with open(keypoints_file, 'r') as f:
                data = json.load(f)
                self.reference_points = data['points']
            print(f"✅ Loaded reference keypoints from {keypoints_file}")
        else:
            print(f"⚠️ No keypoints file found. Please run labeler.py first.")
        
        # Mood detection thresholds (based on cat behavior science)
        self.thresholds = {
            'friendly': {
                'tail_curl_max': 130,      # degrees - curled tail
                'head_tilt_min': 10,       # degrees - head tilted up
                'head_tilt_max': 50,
                'ear_forward_min': 20,     # degrees - ears forward
                'ear_forward_max': 70
            },
            'alert': {
                'tail_angle_min': -15,     # degrees from horizontal
                'tail_angle_max': 15,
                'tail_extension_min': 0.7, # ratio of body length
                'ear_spread_min': 1.4,     # ratio of head width
                'ear_outward_min': 40,     # degrees outward
                'ear_outward_max': 90
            },
            'threatened': {
                'back_arch_min': 145,      # degrees (arched = >145°)
                'ear_pinned_max': -15,     # degrees (pinned back)
                'tail_low_max': -40,       # degrees (tucked low)
                'body_crouch_max': 0.6     # ratio of normal height
            },
            'hunting': {
                'neck_angle_min': 70,      # degrees perpendicular to spine
                'neck_angle_max': 110,
                'back_straight_max': 20,   # degrees deviation from straight
                'tail_low_min': -60,       # degrees pointing down
                'tail_low_max': -25,
                'tail_straight_max': 20    # degrees from straight
            },
            'relaxed': {
                'tail_loose_min': 140,     # degrees (loose curve)
                'tail_loose_max': 180,
                'ear_neutral_min': -10,    # degrees
                'ear_neutral_max': 30,
                'body_normal_min': 0.8,    # ratio
                'body_normal_max': 1.2
            }
        }
    
    def calculate_angle(self, a, b, c):
        """Calculate angle at point b between vectors ba and bc"""
        if None in (a, b, c):
            return None
        
        ba = (a[0] - b[0], a[1] - b[1])
        bc = (c[0] - b[0], c[1] - b[1])
        
        dot = ba[0]*bc[0] + ba[1]*bc[1]
        mag_ba = math.sqrt(ba[0]**2 + ba[1]**2)
        mag_bc = math.sqrt(bc[0]**2 + bc[1]**2)
        
        if mag_ba == 0 or mag_bc == 0:
            return None
        
        cos_angle = dot / (mag_ba * mag_bc)
        cos_angle = max(-1, min(1, cos_angle))
        
        return math.degrees(math.acos(cos_angle))
    
    def calculate_distance(self, a, b):
        """Euclidean distance between two points"""
        if None in (a, b):
            return None
        return math.sqrt((a[0]-b[0])**2 + (a[1]-b[1])**2)
    
    def extract_features(self, points):
        """Extract all geometric features from keypoints"""
        features = {}
        
        # Create lookup dict
        pts = {name: points[i] if i < len(points) else None 
               for i, name in enumerate(self.keypoints_names)}
        
        # 1. TAIL CURL ANGLE (at mid point)
        features['tail_curl'] = self.calculate_angle(
            pts['tail_base'], pts['tail_mid'], pts['tail_tip']
        )
        
        # 2. TAIL ANGLE FROM HORIZONTAL
        if pts['tail_base'] and pts['tail_tip']:
            dx = pts['tail_tip'][0] - pts['tail_base'][0]
            dy = pts['tail_tip'][1] - pts['tail_base'][1]
            features['tail_angle'] = math.degrees(math.atan2(dy, dx))
        else:
            features['tail_angle'] = None
        
        # 3. TAIL EXTENSION (length relative to body)
        body_length = self.calculate_distance(pts['neck_base'], pts['tail_base'])
        tail_length = self.calculate_distance(pts['tail_base'], pts['tail_tip'])
        features['tail_extension'] = tail_length / body_length if body_length and tail_length else None
        
        # 4. HEAD TILT ANGLE
        features['head_tilt'] = self.calculate_angle(
            pts['neck_base'], pts['head_top'], pts['nose']
        )
        
        # 5. EAR FORWARD ANGLE (average of both ears)
        left_ear_angle = self.calculate_angle(
            pts['left_ear_base'], pts['left_ear_tip'], pts['nose']
        )
        right_ear_angle = self.calculate_angle(
            pts['right_ear_base'], pts['right_ear_tip'], pts['nose']
        )
        features['ear_forward'] = np.mean([a for a in [left_ear_angle, right_ear_angle] if a])
        
        # 6. EAR SPREAD (distance between ear tips / head width)
        ear_tip_dist = self.calculate_distance(pts['left_ear_tip'], pts['right_ear_tip'])
        ear_base_dist = self.calculate_distance(pts['left_ear_base'], pts['right_ear_base'])
        features['ear_spread'] = ear_tip_dist / ear_base_dist if ear_base_dist else None
        
        # 7. EAR OUTWARD ANGLE
        left_outward = self.calculate_angle(
            pts['left_ear_base'], pts['left_ear_tip'], pts['left_ear_base']
        )
        features['ear_outward'] = left_outward if left_outward else None
        
        # 8. EAR PINNED (angle backward)
        features['ear_pinned'] = self.calculate_angle(
            pts['left_ear_base'], pts['left_ear_tip'], pts['neck_base']
        )
        
        # 9. BACK ARCH ANGLE (at spine mid)
        features['back_arch'] = self.calculate_angle(
            pts['neck_base'], pts['spine_mid'], pts['tail_base']
        )
        
        # 10. BACK STRAIGHTNESS (deviation from straight line)
        if pts['neck_base'] and pts['spine_mid'] and pts['tail_base']:
            # Calculate how far spine_mid deviates from line between neck and tail
            line_vec = (pts['tail_base'][0] - pts['neck_base'][0], 
                       pts['tail_base'][1] - pts['neck_base'][1])
            point_vec = (pts['spine_mid'][0] - pts['neck_base'][0],
                        pts['spine_mid'][1] - pts['neck_base'][1])
            # Cross product magnitude gives deviation
            cross = abs(line_vec[0]*point_vec[1] - line_vec[1]*point_vec[0])
            line_len = math.sqrt(line_vec[0]**2 + line_vec[1]**2)
            features['back_deviation'] = cross / line_len if line_len > 0 else None
        else:
            features['back_deviation'] = None
        
        # 11. NECK ANGLE (between neck and spine)
        features['neck_angle'] = self.calculate_angle(
            pts['head_top'], pts['neck_base'], pts['spine_mid']
        )
        
        # 12. BODY CROUCH (shoulder height relative to normal)
        body_height = pts['spine_mid'][1] if pts['spine_mid'] else None
        features['body_crouch'] = body_height
        
        return features
    
    def classify_mood(self, features):
        """Classify mood based on extracted features"""
        scores = {
            'Friendly': 0,
            'Alert': 0,
            'Threatened': 0,
            'Hunting': 0,
            'Relaxed': 0
        }
        
        details = {}
        
        # --- FRIENDLY DETECTION ---
        friendly_score = 0
        if features['tail_curl'] and features['tail_curl'] < self.thresholds['friendly']['tail_curl_max']:
            friendly_score += 35
            details['tail_curled'] = f"{features['tail_curl']:.0f}°"
        
        if features['head_tilt'] and self.thresholds['friendly']['head_tilt_min'] < features['head_tilt'] < self.thresholds['friendly']['head_tilt_max']:
            friendly_score += 25
            details['head_tilted'] = f"{features['head_tilt']:.0f}°"
        
        if features['ear_forward'] and self.thresholds['friendly']['ear_forward_min'] < features['ear_forward'] < self.thresholds['friendly']['ear_forward_max']:
            friendly_score += 20
            details['ears_forward'] = f"{features['ear_forward']:.0f}°"
        
        scores['Friendly'] = friendly_score
        details['friendly_score'] = friendly_score
        
        # --- ALERT DETECTION ---
        alert_score = 0
        if features['tail_angle'] and self.thresholds['alert']['tail_angle_min'] < features['tail_angle'] < self.thresholds['alert']['tail_angle_max']:
            alert_score += 25
            details['tail_straight'] = f"{features['tail_angle']:.0f}°"
        
        if features['tail_extension'] and features['tail_extension'] > self.thresholds['alert']['tail_extension_min']:
            alert_score += 15
            details['tail_extended'] = f"{features['tail_extension']:.2f}"
        
        if features['ear_spread'] and features['ear_spread'] > self.thresholds['alert']['ear_spread_min']:
            alert_score += 30
            details['ears_spread'] = f"{features['ear_spread']:.2f}x"
        
        if features['ear_outward'] and self.thresholds['alert']['ear_outward_min'] < features['ear_outward'] < self.thresholds['alert']['ear_outward_max']:
            alert_score += 20
            details['ears_outward'] = f"{features['ear_outward']:.0f}°"
        
        scores['Alert'] = alert_score
        details['alert_score'] = alert_score
        
        # --- THREATENED DETECTION ---
        threatened_score = 0
        if features['back_arch'] and features['back_arch'] > self.thresholds['threatened']['back_arch_min']:
            threatened_score += 35
            details['back_arched'] = f"{features['back_arch']:.0f}°"
        
        if features['ear_pinned'] and features['ear_pinned'] < self.thresholds['threatened']['ear_pinned_max']:
            threatened_score += 25
            details['ears_pinned'] = f"{features['ear_pinned']:.0f}°"
        
        if features['tail_angle'] and features['tail_angle'] < self.thresholds['threatened']['tail_low_max']:
            threatened_score += 20
            details['tail_low'] = f"{features['tail_angle']:.0f}°"
        
        scores['Threatened'] = threatened_score
        details['threatened_score'] = threatened_score
        
        # --- HUNTING DETECTION ---
        hunting_score = 0
        if features['neck_angle'] and self.thresholds['hunting']['neck_angle_min'] < features['neck_angle'] < self.thresholds['hunting']['neck_angle_max']:
            hunting_score += 35
            details['neck_perpendicular'] = f"{features['neck_angle']:.0f}°"
        
        if features['back_deviation'] and features['back_deviation'] < self.thresholds['hunting']['back_straight_max']:
            hunting_score += 25
            details['back_straight'] = f"deviation {features['back_deviation']:.1f}"
        
        if features['tail_angle'] and self.thresholds['hunting']['tail_low_min'] < features['tail_angle'] < self.thresholds['hunting']['tail_low_max']:
            hunting_score += 20
            details['tail_pointing'] = f"{features['tail_angle']:.0f}°"
        
        scores['Hunting'] = hunting_score
        details['hunting_score'] = hunting_score
        
        # --- RELAXED DETECTION ---
        relaxed_score = 0
        if features['tail_curl'] and self.thresholds['relaxed']['tail_loose_min'] < features['tail_curl'] < self.thresholds['relaxed']['tail_loose_max']:
            relaxed_score += 30
            details['tail_loose'] = f"{features['tail_curl']:.0f}°"
        
        if features['ear_forward'] and self.thresholds['relaxed']['ear_neutral_min'] < features['ear_forward'] < self.thresholds['relaxed']['ear_neutral_max']:
            relaxed_score += 25
            details['ears_neutral'] = f"{features['ear_forward']:.0f}°"
        
        # Body normalcy (not too crouched or stretched)
        if not threatened_score > 30 and not hunting_score > 30:
            relaxed_score += 20
        
        scores['Relaxed'] = relaxed_score
        details['relaxed_score'] = relaxed_score
        
        # Get primary mood (highest score)
        primary_mood = max(scores, key=scores.get)
        confidence = scores[primary_mood]
        
        # Generate feedback based on detected features
        feedback = []
        if primary_mood == 'Friendly':
            feedback.append("🐱 Curled tail and upward head tilt indicate friendliness")
            if features['head_tilt']:
                feedback.append(f"👆 Head tilted up at {features['head_tilt']:.0f}° - approachable posture")
        elif primary_mood == 'Alert':
            feedback.append("👀 Ears spread wide and tail straight - cat is attentive")
            feedback.append("⚠️ Your cat is alert and aware of surroundings")
        elif primary_mood == 'Threatened':
            feedback.append("😰 Arched back and pinned ears show fear or threat response")
            feedback.append("🛡️ Give your cat space and remove perceived threats")
        elif primary_mood == 'Hunting':
            feedback.append("🎯 Hunting posture detected - perpendicular neck, straight back")
            feedback.append("🐭 Your cat is focused and ready to pounce!")
        elif primary_mood == 'Relaxed':
            feedback.append("😌 Loose tail and neutral ears - cat feels safe and comfortable")
        
        return {
            'mood': primary_mood,
            'confidence': confidence,
            'all_scores': scores,
            'details': details,
            'feedback': feedback
        }

# Initialize classifier
classifier = CatMoodClassifier()

# HTML Template
HTML_TEMPLATE = '''
<!DOCTYPE html>
<html>
<head>
    <title>Cat Mood Classifier - Body Language Analysis</title>
    <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); margin: 0; padding: 20px; }
        .container { max-width: 1000px; margin: auto; background: white; border-radius: 20px; padding: 30px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
        h1 { text-align: center; color: #FF6B35; }
        .upload-area { border: 3px dashed #FF6B35; border-radius: 15px; padding: 40px; text-align: center; background: #FFF8F0; cursor: pointer; margin: 20px 0; }
        button { background: #FF6B35; color: white; padding: 12px 30px; border: none; border-radius: 8px; font-size: 16px; cursor: pointer; margin: 10px; }
        .result-card { margin-top: 20px; padding: 20px; border-radius: 15px; display: none; }
        .mood-friendly { background: #C8E6C9; border-left: 10px solid #4CAF50; }
        .mood-alert { background: #FFE0B2; border-left: 10px solid #FF9800; }
        .mood-threatened { background: #FFCDD2; border-left: 10px solid #F44336; }
        .mood-hunting { background: #B3E5FC; border-left: 10px solid #2196F3; }
        .mood-relaxed { background: #E8EAF6; border-left: 10px solid #9C27B0; }
        .mood-title { font-size: 32px; font-weight: bold; text-align: center; }
        .confidence { font-size: 18px; text-align: center; margin: 10px 0; }
        .score-bar { height: 30px; background: #e0e0e0; border-radius: 15px; overflow: hidden; margin: 10px 0; }
        .score-fill { height: 100%; background: #FF6B35; transition: width 0.5s; display: flex; align-items: center; justify-content: flex-end; padding-right: 10px; color: white; font-weight: bold; }
        img { max-width: 100%; border-radius: 10px; margin: 20px 0; box-shadow: 0 5px 20px rgba(0,0,0,0.2); }
        .feature-list { list-style: none; padding: 0; }
        .feature-list li { padding: 5px 0; border-bottom: 1px solid #ddd; }
        .loading { text-align: center; display: none; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🐱 Cat Body Language Mood Classifier</h1>
        <p style="text-align: center">Analyzes tail curl, ear position, back arch, and head tilt to determine mood</p>
        
        <div class="upload-area" onclick="document.getElementById('imageInput').click()">
            <input type="file" id="imageInput" accept="image/*" style="display: none">
            <p>📸 Click to upload cat photo</p>
            <p style="font-size: 12px">Detects: Friendly 😊 | Alert 👀 | Threatened 😰 | Hunting 🎯 | Relaxed 😌</p>
        </div>
        
        <div style="text-align: center">
            <button onclick="analyzeImage()">🔍 Classify Mood</button>
        </div>
        
        <div class="loading" id="loading">
            <p>📊 Analyzing body language...</p>
        </div>
        
        <div id="result"></div>
    </div>
    
    <script>
        let currentImageData = null;
        
        document.getElementById('imageInput').onchange = function(e) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = function(event) {
                currentImageData = event.target.result.split(',')[1];
                document.getElementById('result').innerHTML = '<p style="text-align:center;color:green">✅ Image loaded! Click "Classify Mood"</p>';
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
            
            const response = await fetch('/classify', {
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
            document.getElementById('result').innerHTML = `
                <div class="result-card mood-${moodClass}" style="display:block">
                    <div class="mood-title">
                        ${data.mood === 'Friendly' ? '😊' : data.mood === 'Alert' ? '👀' : data.mood === 'Threatened' ? '😰' : data.mood === 'Hunting' ? '🎯' : '😌'} 
                        ${data.mood}
                        ${data.mood === 'Friendly' ? '😊' : data.mood === 'Alert' ? '👀' : data.mood === 'Threatened' ? '😰' : data.mood === 'Hunting' ? '🎯' : '😌'}
                    </div>
                    <div class="confidence">Confidence: ${data.confidence}%</div>
                    
                    <h3>📊 Mood Scores:</h3>
                    ${Object.entries(data.scores).map(([mood, score]) => `
                        <div>${mood}</div>
                        <div class="score-bar">
                            <div class="score-fill" style="width: ${score}%; background: ${mood === data.mood ? '#4CAF50' : '#FF6B35'}">${score}%</div>
                        </div>
                    `).join('')}
                    
                    <h3>🔍 Detected Body Language Features:</h3>
                    <ul class="feature-list">
                        ${Object.entries(data.detected_features).map(([feature, value]) => `<li>✓ ${feature.replace(/_/g, ' ')}: ${value}</li>`).join('')}
                    </ul>
                    
                    <h3>💡 Analysis:</h3>
                    <ul>
                        ${data.feedback.map(f => `<li>${f}</li>`).join('')}
                    </ul>
                </div>
            `;
            document.getElementById('result').style.display = 'block';
        }
    </script>
</body>
</html>
'''

@app.route('/')
def index():
    return HTML_TEMPLATE

@app.route('/classify', methods=['POST'])
def classify():
    try:
        data = request.json
        image_data = data['image']
        
        # Decode image
        img_bytes = base64.b64decode(image_data)
        np_arr = np.frombuffer(img_bytes, np.uint8)
        img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
        
        # Load keypoints (from labeled reference)
        if classifier.reference_points is None:
            return jsonify({'error': 'No keypoints reference found. Please run labeler.py first to create keypoints.json'}), 400
        
        # Use reference points for demo
        # In production, you'd run pose estimation here
        points = [(p[0], p[1]) if p else None for p in classifier.reference_points]
        
        # Extract features and classify
        features = classifier.extract_features(points)
        result = classifier.classify_mood(features)
        
        # Filter out None values from details
        detected_features = {k: v for k, v in result['details'].items() if v and not k.endswith('_score')}
        
        return jsonify({
            'mood': result['mood'],
            'confidence': result['confidence'],
            'scores': result['all_scores'],
            'detected_features': detected_features,
            'feedback': result['feedback']
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("🐱 CAT BODY LANGUAGE MOOD CLASSIFIER")
    print("=" * 50)
    print("Detects 5 moods: Friendly, Alert, Threatened, Hunting, Relaxed")
    print("\n📝 First, run labeler.py to create keypoints.json")
    print("🌐 Then open http://localhost:5000")
    print("\nThe system analyzes:")
    print("  • Tail curl angle (friendly/relaxed)")
    print("  • Ear spread and angle (alert/threatened)")
    print("  • Back arch (threatened)")
    print("  • Neck angle (hunting)")
    print("  • Head tilt (friendly)")
    app.run(debug=True, host='0.0.0.0', port=5000)