import React, { useMemo } from 'react';
import { Emotion } from '../types';
import { EMOTIONS } from '../constants'; // Corrected import
import Button from './Button';

interface EmotionDisplayProps {
  currentEmotion: Emotion | 'Undetermined' | 'Initializing';
  confidences: Record<Emotion, number>;
  onManualSelect: (emotion: Emotion) => void;
}

const EmotionDisplay: React.FC<EmotionDisplayProps> = ({ currentEmotion, confidences, onManualSelect }) => {
  const currentEmotionConfidence = useMemo(() => {
    if (currentEmotion === 'Undetermined' || currentEmotion === 'Initializing') return 0;
    return Math.round((confidences[currentEmotion] || 0) * 100);
  }, [currentEmotion, confidences]);

  const emotionColors: Record<Emotion, string> = {
    Happy: 'text-yellow-400',
    Sad: 'text-blue-400',
    Angry: 'text-red-400',
    Surprised: 'text-purple-400',
    Fearful: 'text-gray-400',
    Disgusted: 'text-green-400',
    Neutral: 'text-white',
  };

  const getEmotionColorClass = (emotion: Emotion | 'Undetermined' | 'Initializing') => {
    if (emotion === 'Undetermined' || emotion === 'Initializing') return 'text-gray-500';
    return emotionColors[emotion];
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-xl flex flex-col items-center justify-center text-center">
      <h2 className="text-xl font-semibold mb-4 text-blue-300">Current Emotion</h2>
      <div className={`text-5xl font-extrabold ${getEmotionColorClass(currentEmotion)} mb-4`}>
        {currentEmotion}
      </div>

      <div className="w-full bg-gray-600 rounded-full h-4 mb-4">
        <div
          className="bg-gradient-to-r from-blue-400 to-purple-600 h-4 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${currentEmotionConfidence}%` }}
        ></div>
      </div>
      <p className="text-lg text-gray-300 mb-6">Confidence: {currentEmotionConfidence}%</p>

      <h3 className="text-lg font-medium mb-3 text-blue-200">Manual Override:</h3>
      <div className="flex flex-wrap justify-center gap-2">
        {EMOTIONS.map((emotion) => (
          <Button
            key={emotion}
            onClick={() => onManualSelect(emotion)}
            variant={currentEmotion === emotion ? 'primary' : 'secondary'}
            className="text-sm px-3 py-1"
          >
            {emotion}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default EmotionDisplay;