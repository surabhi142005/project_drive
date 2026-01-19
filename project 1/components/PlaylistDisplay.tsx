import React from 'react';
import { Song } from '../types';
import Button from './Button';
import Spinner from './Spinner';

interface PlaylistDisplayProps {
  playlist: Song[];
  currentlyPlaying: Song | null;
  onControl: (action: 'play' | 'pause' | 'skip' | 'prev') => void;
  isLoading: boolean;
  onSongSelect: (song: Song) => void; // Added for selecting a specific song
}

const PlaylistDisplay: React.FC<PlaylistDisplayProps> = ({ playlist, currentlyPlaying, onControl, isLoading, onSongSelect }) => {
  const PlaceholderImage = 'https://picsum.photos/128/128'; // Placeholder album art

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-xl flex flex-col">
      <h2 className="text-xl font-semibold mb-4 text-blue-300">Recommended Playlist</h2>

      {isLoading ? (
        <div className="flex justify-center items-center h-48">
          <Spinner />
          <p className="ml-3 text-lg text-gray-300">Generating your mood-tuned playlist...</p>
        </div>
      ) : playlist.length === 0 ? (
        <p className="text-gray-400 text-center py-8">
          No songs in your playlist yet. Start the camera and detect an emotion to get recommendations!
        </p>
      ) : (
        <>
          <div className="current-track-info bg-gray-700 p-4 rounded-lg flex items-center mb-6">
            <img
              src={currentlyPlaying?.albumArtUrl || PlaceholderImage}
              alt={currentlyPlaying?.album || 'Album Art'}
              className="w-20 h-20 rounded-md shadow-md mr-4 object-cover"
            />
            <div className="flex-grow">
              <p className="text-xl font-bold text-white truncate">{currentlyPlaying?.title || 'No Track Playing'}</p>
              <p className="text-gray-300">{currentlyPlaying?.artist || 'Unknown Artist'}</p>
              <p className="text-sm text-gray-400 truncate">{currentlyPlaying?.album || 'Unknown Album'}</p>
            </div>
          </div>

          <div className="playback-controls flex justify-center gap-4 mb-6">
            <Button onClick={() => onControl('prev')} variant="secondary" className="p-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </Button>
            <Button onClick={() => onControl('play')} variant="primary" className="p-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.118l-3.324-2.22A1 1 0 0010 9.772v4.456a1 1 0 001.428.894l3.324-2.22a1 1 0 000-1.788z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </Button>
            <Button onClick={() => onControl('pause')} variant="secondary" className="p-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </Button>
            <Button onClick={() => onControl('skip')} variant="secondary" className="p-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            </Button>
          </div>

          <div className="playlist-scroll-area overflow-y-auto h-64 border border-gray-700 rounded-md p-2">
            {playlist.map((song) => (
              <div
                key={song.id}
                className={`flex items-center p-3 rounded-lg mb-2 cursor-pointer transition-colors duration-200
                  ${currentlyPlaying?.id === song.id ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-700 hover:bg-gray-600 text-gray-200'}`}
                onClick={() => onSongSelect(song)} // Simplified: Clicking a song makes it "currently playing"
              >
                <img
                  src={song.albumArtUrl || PlaceholderImage}
                  alt={song.album}
                  className="w-10 h-10 rounded-full object-cover mr-3"
                />
                <div>
                  <p className="font-semibold text-base truncate">{song.title}</p>
                  <p className="text-sm text-gray-300">{song.artist}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default PlaylistDisplay;