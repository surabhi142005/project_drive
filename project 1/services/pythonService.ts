import { Emotion } from '../types';
import { EMOTIONS } from '../constants';

const PYTHON_BACKEND_URL = 'http://localhost:5000';

// Helper to validate and convert confidence scores
function parseConfidences(data: any): Record<Emotion, number> {
  const confidences: Record<Emotion, number> = Object.fromEntries(EMOTIONS.map(e => [e, 0])) as Record<Emotion, number>;
  if (data && typeof data === 'object') {
    EMOTIONS.forEach(emotion => {
      if (typeof data[emotion.toLowerCase()] === 'number' && data[emotion.toLowerCase()] >= 0 && data[emotion.toLowerCase()] <= 1) {
        confidences[emotion] = data[emotion.toLowerCase()];
      }
    });
  }
  return confidences;
}

export async function detectEmotion(base64ImageData: string): Promise<{ emotion: Emotion | 'Undetermined', confidences: Record<Emotion, number> }> {
  try {
    const response = await fetch(`${PYTHON_BACKEND_URL}/detect_emotion`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: base64ImageData,
      }),
    });

    if (!response.ok) {
      throw new Error(`Python backend returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data || typeof data !== 'object') {
      console.warn("Python backend returned invalid JSON for emotion detection.");
      return {
        emotion: 'Undetermined',
        confidences: parseConfidences(null),
      };
    }

    const dominantEmotion: Emotion | 'Undetermined' = EMOTIONS.includes(data.dominant_emotion as Emotion)
      ? (data.dominant_emotion as Emotion)
      : 'Undetermined';

    const confidences = parseConfidences(data.emotions);

    return { emotion: dominantEmotion, confidences: confidences };

  } catch (error: any) {
    console.error("Error detecting emotion with Python backend:", error);
    throw new Error(`Python backend call failed: ${error.message || 'Unknown error'}`);
  }
}
