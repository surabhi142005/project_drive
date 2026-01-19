from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
import io
from PIL import Image
from deepface import DeepFace
import numpy as np

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route('/detect_emotion', methods=['POST'])
def detect_emotion():
    print("Received emotion detection request")
    try:
        data = request.get_json()
        if not data or 'image' not in data:
            print("No image data in request")
            return jsonify({'error': 'No image data provided'}), 400

        # Decode base64 image
        image_data = base64.b64decode(data['image'])
        print(f"Decoded image data, length: {len(image_data)}")
        image = Image.open(io.BytesIO(image_data))
        print(f"Image opened, size: {image.size}, mode: {image.mode}")

        # Convert to RGB if necessary
        if image.mode != 'RGB':
            image = image.convert('RGB')
            print("Converted to RGB")

        # Convert PIL image to numpy array
        img_array = np.array(image)
        print(f"Converted to numpy array, shape: {img_array.shape}")

        # Analyze emotion using DeepFace
        print("Starting DeepFace analysis...")
        result = DeepFace.analyze(img_array, actions=['emotion'], enforce_detection=False)
        print(f"DeepFace result: {result}")

        if isinstance(result, list) and len(result) > 0:
            emotions = result[0]['emotion']
            dominant_emotion = result[0]['dominant_emotion']
            print(f"Emotions: {emotions}, Dominant: {dominant_emotion}")
        else:
            # Fallback if no face detected
            print("No face detected, using fallback")
            emotions = {emotion: 0 for emotion in ['angry', 'disgust', 'fear', 'happy', 'sad', 'surprise', 'neutral']}
            dominant_emotion = 'neutral'

        # Map emotions to match frontend expectations
        emotion_mapping = {
            'angry': 'Angry',
            'disgust': 'Disgusted',
            'fear': 'Fearful',
            'happy': 'Happy',
            'sad': 'Sad',
            'surprise': 'Surprised',
            'neutral': 'Neutral'
        }

        mapped_emotions = {}
        for key, value in emotions.items():
            mapped_key = emotion_mapping.get(key, key)
            mapped_emotions[mapped_key] = value / 100.0  # Convert to 0-1 scale

        response = {
            'dominant_emotion': emotion_mapping.get(dominant_emotion, dominant_emotion),
            'emotions': mapped_emotions
        }

        return jsonify(response)

    except Exception as e:
        print(f"Error in emotion detection: {str(e)}")
        return jsonify({'error': 'Emotion detection failed', 'details': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
