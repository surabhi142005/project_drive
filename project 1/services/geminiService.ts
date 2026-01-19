import { GoogleGenAI, Type } from '@google/genai';
import { Emotion } from '../types';
import { EMOTIONS } from '../constants'; // Corrected import

// Assume process.env.API_KEY is available in the environment
const API_KEY = process.env.API_KEY;

// Helper to validate and convert confidence scores
function parseConfidences(data: any): Record<Emotion, number> {
  const confidences: Record<Emotion, number> = Object.fromEntries(EMOTIONS.map(e => [e, 0])) as Record<Emotion, number>;
  if (data && typeof data === 'object') {
    EMOTIONS.forEach(emotion => {
      if (typeof data[emotion] === 'number' && data[emotion] >= 0 && data[emotion] <= 1) {
        confidences[emotion] = data[emotion];
      }
    });
  }
  return confidences;
}

export async function detectEmotion(base64ImageData: string, modelName: string): Promise<{ emotion: Emotion | 'Undetermined', confidences: Record<Emotion, number> }> {
  if (!API_KEY) {
    throw new Error("Gemini API key is not configured. Please ensure process.env.API_KEY is set.");
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });

  const textInstruction = `Analyze the facial expression in this image and classify the dominant emotion from these categories: ${EMOTIONS.join(', ')}. Provide a confidence score (0-1) for each of these emotions. If no face is detected or emotion cannot be confidently classified, state "Undetermined" for the dominant emotion and zero for all confidences. Return the response as a JSON object.`;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      dominantEmotion: {
        type: Type.STRING,
        enum: [...EMOTIONS, 'Undetermined'],
        description: 'The primary detected emotion or "Undetermined" if no clear emotion/face is found.',
      },
      confidences: {
        type: Type.OBJECT,
        properties: Object.fromEntries(
          EMOTIONS.map(emotion => [emotion, { type: Type.NUMBER, description: `Confidence score for ${emotion} (0-1)` }])
        ),
        description: 'Confidence scores for each emotion category.',
      },
    },
    required: ['dominantEmotion', 'confidences'],
  };

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: {
        parts: [
          { text: textInstruction },
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64ImageData,
            },
          },
        ],
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: responseSchema,
        temperature: 0.2, // Keep temperature low for more deterministic emotion classification
      },
    });

    const jsonString = response.text?.trim();

    if (!jsonString) {
      console.warn("Gemini API returned an empty or invalid JSON string for emotion detection.");
      return {
        emotion: 'Undetermined',
        confidences: parseConfidences(null),
      };
    }

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(jsonString);
    } catch (parseError) {
      console.error("Failed to parse Gemini JSON response:", parseError, "Raw response:", jsonString);
      return {
        emotion: 'Undetermined',
        confidences: parseConfidences(null),
      };
    }

    const dominantEmotion: Emotion | 'Undetermined' = EMOTIONS.includes(parsedResponse.dominantEmotion)
      ? parsedResponse.dominantEmotion
      : 'Undetermined';

    const confidences = parseConfidences(parsedResponse.confidences);

    return { emotion: dominantEmotion, confidences: confidences };

  } catch (error: any) {
    console.error("Error detecting emotion with Gemini API:", error);
    if (error.status === 400 && error.message.includes("API key not valid")) {
       throw new Error("Invalid Gemini API Key. Please check your API key configuration.");
    }
    if (error.message.includes("blocked due to safety reasons")) {
       throw new Error("Gemini API response blocked due to safety reasons.");
    }
    throw new Error(`Gemini API call failed: ${error.message || 'Unknown error'}`);
  }
}

// Helper functions for base64 encoding/decoding if needed for other parts
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}