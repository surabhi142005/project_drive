import React, { useState, useEffect, useCallback, useRef } from 'react';
import WebcamFeed from './components/WebcamFeed';
import EmotionDisplay from './components/EmotionDisplay';
import PlaylistDisplay from './components/PlaylistDisplay';
import EmotionHistoryChart from './components/EmotionHistoryChart';
import SettingsPanel from './components/SettingsPanel';
import Button from './components/Button';
import { Emotion, Song, EmotionMapping, Settings, EmotionHistoryEntry } from './types';
import { defaultEmotionMappings, defaultSettings, EMOTIONS } from './constants';

import * as spotifyService from './services/spotifyService';
import * as localStorageService from './services/localStorageService';
import Modal from './components/Modal';

const App: React.FC = () => {
  const [currentEmotion, setCurrentEmotion] = useState<Emotion | 'Undetermined' | 'Initializing'>('Initializing');
  const [emotionConfidences, setEmotionConfidences] = useState<Record<Emotion, number>>(
    Object.fromEntries(EMOTIONS.map(e => [e, 0])) as Record<Emotion, number>
  );
  const [playlist, setPlaylist] = useState<Song[]>([]);
  const [currentlyPlayingTrack, setCurrentlyPlayingTrack] = useState<Song | null>(null);
  const [emotionHistory, setEmotionHistory] = useState<EmotionHistoryEntry[]>([]);
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [emotionMappings, setEmotionMappings] = useState<Record<Emotion, EmotionMapping>>(defaultEmotionMappings);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const emotionQueue = useRef<Emotion[]>([]);
  const EMOTION_WINDOW_SIZE = 5; // Average over 5 seconds (assuming 1 detection per second or so)
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    // Load settings and mappings from local storage
    const storedSettings = localStorageService.get<Settings>('settings', defaultSettings);
    const storedMappings = localStorageService.get<Record<Emotion, EmotionMapping>>('emotionMappings', defaultEmotionMappings);
    setSettings(storedSettings);
    setEmotionMappings(storedMappings);
  }, []);

  useEffect(() => {
    localStorageService.set('settings', settings);
  }, [settings]);

  useEffect(() => {
    localStorageService.set('emotionMappings', emotionMappings);
  }, [emotionMappings]);

  const handleEmotionDetected = useCallback((emotionResult: { emotion: Emotion | 'Undetermined', confidences: Record<Emotion, number> }) => {
    if (emotionResult.emotion !== 'Undetermined') {
      emotionQueue.current.push(emotionResult.emotion);
      if (emotionQueue.current.length > EMOTION_WINDOW_SIZE) {
        emotionQueue.current.shift();
      }

      const counts: Partial<Record<Emotion, number>> = {};
      emotionQueue.current.forEach(e => {
        counts[e] = (counts[e] || 0) + 1;
      });

      let dominantEmotion: Emotion | 'Undetermined' = 'Undetermined';
      let maxCount = 0;
      for (const emotionKey in counts) {
        const emo = emotionKey as Emotion;
        if (counts[emo]! > maxCount) {
          maxCount = counts[emo]!;
          dominantEmotion = emo;
        }
      }
      
      setCurrentEmotion(dominantEmotion);
      setEmotionConfidences(emotionResult.confidences);

      setEmotionHistory(prev => {
        const now = new Date();
        const newEntry = { time: now.toLocaleTimeString(), emotion: dominantEmotion, confidence: emotionResult.confidences[dominantEmotion as Emotion] || 0 };
        return [...prev, newEntry].slice(-20); // Keep last 20 entries for the chart
      });
    } else {
      setCurrentEmotion('Undetermined');
    }
  }, []);

  const generateRecommendations = useCallback(async (selectedEmotion: Emotion | 'Undetermined' | 'Initializing' = currentEmotion) => {
    if (selectedEmotion === 'Undetermined' || selectedEmotion === 'Initializing') return;

    setIsLoadingRecommendations(true);
    setError(null);
    try {
      const mapping = emotionMappings[selectedEmotion];
      const newPlaylist = await spotifyService.getRecommendations(
        mapping,
        settings.spotifyDiscoveryMode // Pass discovery mode setting
      );
      setPlaylist(newPlaylist);
      if (newPlaylist.length > 0) {
        setCurrentlyPlayingTrack(newPlaylist[0]);
      } else {
        setCurrentlyPlayingTrack(null);
      }
    } catch (err) {
      console.error("Failed to fetch recommendations:", err);
      setError("Failed to fetch music recommendations. Please try again.");
      setPlaylist([]);
      setCurrentlyPlayingTrack(null);
    } finally {
      setIsLoadingRecommendations(false);
    }
  }, [currentEmotion, emotionMappings, settings.spotifyDiscoveryMode]);

  useEffect(() => {
    // Regenerate recommendations whenever the dominant emotion changes
    if (currentEmotion !== 'Undetermined' && currentEmotion !== 'Initializing') {
      const timer = setTimeout(() => {
        generateRecommendations(currentEmotion);
      }, 1000); // Debounce to prevent rapid regeneration
      return () => clearTimeout(timer);
    }
  }, [currentEmotion, generateRecommendations]);

  const handleManualEmotionChange = useCallback((emotion: Emotion) => {
    setCurrentEmotion(emotion);
    // Clear emotion queue to ensure manual override takes immediate effect
    emotionQueue.current = [emotion];
    // Set confidence for manual emotion to 100% and others to 0
    const manualConfidences = Object.fromEntries(EMOTIONS.map(e => [e, e === emotion ? 1 : 0])) as Record<Emotion, number>;
    setEmotionConfidences(manualConfidences);
    generateRecommendations(emotion);
  }, [generateRecommendations]);

  const toggleWebcam = useCallback(() => {
    setIsWebcamActive(prev => !prev);
    if (!isWebcamActive) {
      setCurrentEmotion('Initializing');
      setError(null);
      setEmotionConfidences(Object.fromEntries(EMOTIONS.map(e => [e, 0])) as Record<Emotion, number>);
      setEmotionHistory([]);
      emotionQueue.current = [];
    } else {
      setCurrentEmotion('Undetermined');
    }
  }, [isWebcamActive]);

  const handleSongSelect = useCallback((song: Song) => {
    setCurrentlyPlayingTrack(song);
    if (audioRef.current && song.previewUrl) {
      audioRef.current.src = song.previewUrl;
      audioRef.current.play();
    }
  }, []);
    if (!playlist.length) return;

    setPlaylist(prevPlaylist => {
      let newPlayingTrack: Song | null = null;
      let newPlaylist = [...prevPlaylist];

      if (action === 'skip') {
        const currentIndex = newPlaylist.findIndex(t => t.id === currentlyPlayingTrack?.id);
        if (currentIndex !== -1 && currentIndex < newPlaylist.length - 1) {
          newPlayingTrack = newPlaylist[currentIndex + 1];
        } else if (newPlaylist.length > 0) {
          // Loop back to the start if at the end
          newPlayingTrack = newPlaylist[0];
        }
      } else if (action === 'prev') {
        const currentIndex = newPlaylist.findIndex(t => t.id === currentlyPlayingTrack?.id);
        if (currentIndex > 0) {
          newPlayingTrack = newPlaylist[currentIndex - 1];
        } else if (newPlaylist.length > 0) {
          // Loop to the end if at the start
          newPlayingTrack = newPlaylist[newPlaylist.length - 1];
        }
      } else if (action === 'play' || action === 'pause') {
        // For play/pause, just keep the current track or set the first if none is playing
        if (!currentlyPlayingTrack && newPlaylist.length > 0) {
          newPlayingTrack = newPlaylist[0];
        } else {
          newPlayingTrack = currentlyPlayingTrack;
        }
      }
      setCurrentlyPlayingTrack(newPlayingTrack);

      // Handle audio
      if (audioRef.current && newPlayingTrack?.previewUrl) {
        if (action === 'play') {
          audioRef.current.src = newPlayingTrack.previewUrl;
          audioRef.current.play();
        } else if (action === 'pause') {
          audioRef.current.pause();
        } else if (action === 'skip' || action === 'prev') {
          audioRef.current.src = newPlayingTrack.previewUrl;
          audioRef.current.play();
        }
      }

      return newPlaylist;
    });
  }, [playlist, currentlyPlayingTrack]);

  // Dynamically set background color based on current emotion
  const getBackgroundColor = (emotion: Emotion | 'Undetermined' | 'Initializing') => {
    switch (emotion) {
      case 'Happy': return 'bg-yellow-600';
      case 'Sad': return 'bg-blue-600';
      case 'Angry': return 'bg-red-600';
      case 'Surprised': return 'bg-purple-600';
      case 'Fearful': return 'bg-gray-700';
      case 'Disgusted': return 'bg-green-600';
      case 'Neutral': return 'bg-gray-800';
      default: return 'bg-gray-900';
    }
  };

  return (
    <div className={`flex flex-col min-h-screen transition-colors duration-500 ${getBackgroundColor(currentEmotion)}`}>
      <header className="flex-shrink-0 p-4 bg-gray-950 shadow-lg z-10 flex flex-col sm:flex-row items-center justify-between">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 mb-2 sm:mb-0">
          MoodTunes
        </h1>
        <div className="flex flex-wrap gap-2 items-center">
          <Button onClick={toggleWebcam} variant={isWebcamActive ? 'secondary' : 'primary'}>
            {isWebcamActive ? 'Stop Camera' : 'Start Camera'}
          </Button>
          <Button onClick={() => generateRecommendations()} variant="info" disabled={isLoadingRecommendations || currentEmotion === 'Undetermined' || currentEmotion === 'Initializing'}>
            {isLoadingRecommendations ? 'Generating...' : 'Regenerate Playlist'}
          </Button>
          <Button onClick={() => setShowSettingsModal(true)} variant="secondary">
            Settings
          </Button>
        </div>
      </header>

      <main className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 overflow-auto">
        <div className="lg:col-span-1 flex flex-col space-y-6">
          <WebcamFeed
            onEmotionDetected={handleEmotionDetected}
            isActive={isWebcamActive}
            setError={setError}
          />
          {error && <div className="p-4 bg-red-800 text-white rounded-lg">{error}</div>}
          <EmotionDisplay
            currentEmotion={currentEmotion}
            confidences={emotionConfidences}
            onManualSelect={handleManualEmotionChange}
          />
        </div>

        <div className="lg:col-span-2 flex flex-col space-y-6">
          <PlaylistDisplay
            playlist={playlist}
            currentlyPlaying={currentlyPlayingTrack}
            onControl={handlePlaybackControl}
            isLoading={isLoadingRecommendations}
            onSongSelect={handleSongSelect}
          />
          <div className="bg-gray-800 p-6 rounded-lg shadow-xl flex-grow">
            <h2 className="text-xl font-semibold mb-4 text-blue-300">Emotion History</h2>
            <EmotionHistoryChart data={emotionHistory} />
          </div>
        </div>
      </main>

      <audio ref={audioRef} />

      <Modal isOpen={showSettingsModal} onClose={() => setShowSettingsModal(false)} title="Application Settings">
        <SettingsPanel
          settings={settings}
          onSettingsChange={setSettings}
          emotionMappings={emotionMappings}
          onEmotionMappingsChange={setEmotionMappings}
        />
      </Modal>
    </div>
  );
};

export default App;