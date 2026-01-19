import { Emotion, EmotionMapping, Settings } from './types';

export const EMOTIONS: Emotion[] = ['Happy', 'Sad', 'Angry', 'Surprised', 'Fearful', 'Disgusted', 'Neutral'];

export const defaultEmotionMappings: Record<Emotion, EmotionMapping> = {
  Happy: {
    valenceRange: [0.7, 1.0],
    energyRange: [0.6, 1.0],
    danceability: [0.6, 1.0],
    tempo: [120, 150],
    key: 'Major',
    genres: ['pop', 'dance', 'disco', 'funk', 'electronic', 'bollywood', 'hindi pop'],
  },
  Sad: {
    valenceRange: [0.0, 0.3],
    energyRange: [0.0, 0.4],
    danceability: [0.0, 0.4],
    tempo: [60, 90],
    key: 'Minor',
    genres: ['blues', 'acoustic', 'ballad', 'classical', 'ambient'],
  },
  Angry: {
    valenceRange: [0.3, 0.6],
    energyRange: [0.7, 1.0],
    danceability: [0.4, 0.7],
    tempo: [140, 180],
    key: 'Minor/Dissonant',
    genres: ['rock', 'metal', 'punk', 'heavy metal', 'industrial'],
  },
  Surprised: {
    valenceRange: [0.5, 0.8],
    energyRange: [0.7, 1.0],
    danceability: [0.5, 0.8],
    tempo: [100, 140],
    key: 'Major/Minor',
    genres: ['electronic', 'jazz', 'experimental', 'indie pop'],
  },
  Fearful: {
    valenceRange: [0.1, 0.4],
    energyRange: [0.3, 0.7],
    danceability: [0.2, 0.5],
    tempo: [80, 130],
    key: 'Minor',
    genres: ['ambient', 'drone', 'dark wave', 'soundtrack'],
  },
  Disgusted: {
    valenceRange: [0.2, 0.5],
    energyRange: [0.5, 0.8],
    danceability: [0.3, 0.6],
    tempo: [90, 140],
    key: 'Minor',
    genres: ['grunge', 'industrial', 'experimental rock'],
  },
  Neutral: {
    valenceRange: [0.4, 0.7],
    energyRange: [0.4, 0.7],
    danceability: [0.4, 0.7],
    tempo: [90, 120],
    key: 'Various',
    genres: ['lo-fi', 'chillhop', 'ambient', 'acoustic', 'indie folk'],
  },
};

export const defaultSettings: Settings = {
  selectedCameraId: '',
  spotifyDiscoveryMode: true,
};
