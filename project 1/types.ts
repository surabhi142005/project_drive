export type Emotion = 'Happy' | 'Sad' | 'Angry' | 'Surprised' | 'Fearful' | 'Disgusted' | 'Neutral';

export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  albumArtUrl: string;
  spotifyUri: string; // URI for Spotify playback
  previewUrl?: string; // Preview audio URL
}

export interface EmotionMapping {
  valenceRange: [number, number]; // 0.0 - 1.0
  energyRange: [number, number];  // 0.0 - 1.0
  danceability: [number, number]; // 0.0 - 1.0
  tempo: [number, number];        // BPM
  key: string;                    // Major, Minor, Dissonant, Various
  genres: string[];               // e.g., Pop, Dance, Rock
}

export interface Settings {
  selectedCameraId: string;
  spotifyDiscoveryMode: boolean; // true for discovery, false for comfort
}

export interface EmotionHistoryEntry {
  time: string;
  emotion: Emotion | 'Undetermined' | 'Initializing';
  confidence: number;
}
