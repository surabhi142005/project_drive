import { EmotionMapping, Song } from '../types';

// IMPORTANT: This is a MOCK Spotify service.
// A real Spotify integration requires an OAuth flow that typically involves a backend
// to securely handle client secrets and token exchange.
// For this purely frontend application, we are simulating the behavior.

const MOCK_SONGS: Song[] = [
  { id: '1', title: 'Happy Song 1', artist: 'Happy Artist', album: 'Happy Album', albumArtUrl: 'https://picsum.photos/128/128?random=1', spotifyUri: 'spotify:track:mock1', previewUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav' },
  { id: '2', title: 'Happy Song 2', artist: 'Joyful Band', album: 'Sunny Vibes', albumArtUrl: 'https://picsum.photos/128/128?random=2', spotifyUri: 'spotify:track:mock2', previewUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav' },
  { id: '3', title: 'Sad Melody 1', artist: 'Lonely Singer', album: 'Rainy Days', albumArtUrl: 'https://picsum.photos/128/128?random=3', spotifyUri: 'spotify:track:mock3', previewUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav' },
  { id: '4', title: 'Sad Melody 2', artist: 'Blue Notes', album: 'Tears', albumArtUrl: 'https://picsum.photos/128/128?random=4', spotifyUri: 'spotify:track:mock4', previewUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav' },
  { id: '5', title: 'Angry Anthem 1', artist: 'Rage Crew', album: 'Riot', albumArtUrl: 'https://picsum.photos/128/128?random=5', spotifyUri: 'spotify:track:mock5', previewUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav' },
  { id: '6', title: 'Angry Anthem 2', artist: 'Fury Band', album: 'Revolt', albumArtUrl: 'https://picsum.photos/128/128?random=6', spotifyUri: 'spotify:track:mock6', previewUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav' },
  { id: '7', title: 'Surprise Track 1', artist: 'Unexpected Act', album: 'Twist', albumArtUrl: 'https://picsum.photos/128/128?random=7', spotifyUri: 'spotify:track:mock7', previewUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav' },
  { id: '8', title: 'Surprise Track 2', artist: 'Sudden Sounds', album: 'Shockwave', albumArtUrl: 'https://picsum.photos/128/128?random=8', spotifyUri: 'spotify:track:mock8', previewUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav' },
  { id: '9', title: 'Fearful Tone 1', artist: 'Anxious Artist', album: 'Shadows', albumArtUrl: 'https://picsum.photos/128/128?random=9', spotifyUri: 'spotify:track:mock9', previewUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav' },
  { id: '10', title: 'Fearful Tone 2', artist: 'Dreadful Echoes', album: 'Darkness', albumArtUrl: 'https://picsum.photos/128/128?random=10', spotifyUri: 'spotify:track:mock10', previewUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav' },
  { id: '11', title: 'Disgusted Groove 1', artist: 'Revolting Rhythms', album: 'Ugh', albumArtUrl: 'https://picsum.photos/128/128?random=11', spotifyUri: 'spotify:track:mock11', previewUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav' },
  { id: '12', title: 'Disgusted Groove 2', artist: 'Gross Out', album: 'Ew', albumArtUrl: 'https://picsum.photos/128/128?random=12', spotifyUri: 'spotify:track:mock12', previewUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav' },
  { id: '13', title: 'Neutral Tune 1', artist: 'Ambient Echo', album: 'Background', albumArtUrl: 'https://picsum.photos/128/128?random=13', spotifyUri: 'spotify:track:mock13', previewUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav' },
  { id: '14', title: 'Neutral Tune 2', artist: 'Calm Sounds', album: 'Peaceful', albumArtUrl: 'https://picsum.photos/128/128?random=14', spotifyUri: 'spotify:track:mock14', previewUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav' },
  { id: '15', title: 'Upbeat Track', artist: 'Energetic Duo', album: 'Good Mood', albumArtUrl: 'https://picsum.photos/128/128?random=15', spotifyUri: 'spotify:track:mock15', previewUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav' },
  { id: '16', title: 'Chill Vibes', artist: 'Relaxed Artist', album: 'Zen Mode', albumArtUrl: 'https://picsum.photos/128/128?random=16', spotifyUri: 'spotify:track:mock16', previewUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav' },
  { id: '17', title: 'Pump Up Song', artist: 'Adrenaline Rush', album: 'Workout Hits', albumArtUrl: 'https://picsum.photos/128/128?random=17', spotifyUri: 'spotify:track:mock17', previewUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav' },
  { id: '18', title: 'Reflective Piece', artist: 'Thoughtful Musician', album: 'Deep Thoughts', albumArtUrl: 'https://picsum.photos/128/128?random=18', spotifyUri: 'spotify:track:mock18', previewUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav' },
  { id: '19', title: 'Indie Gem', artist: 'Hidden Talent', album: 'Discovery', albumArtUrl: 'https://picsum.photos/128/128?random=19', spotifyUri: 'spotify:track:mock19', previewUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav' },
  { id: '20', title: 'Classic Rock', artist: 'Legendary Band', album: 'Greatest Hits', albumArtUrl: 'https://picsum.photos/128/128?random=20', spotifyUri: 'spotify:track:mock20', previewUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav' },
  // Hindi songs
  { id: '21', title: 'Happy Hindi Song', artist: 'Bollywood Star', album: 'Bollywood Hits', albumArtUrl: 'https://picsum.photos/128/128?random=21', spotifyUri: 'spotify:track:hindi1', previewUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav' },
  { id: '22', title: 'Sad Hindi Melody', artist: 'Indian Singer', album: 'Hindi Sad Songs', albumArtUrl: 'https://picsum.photos/128/128?random=22', spotifyUri: 'spotify:track:hindi2', previewUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav' },
  { id: '23', title: 'Angry Hindi Anthem', artist: 'Rage Bollywood', album: 'Hindi Rock', albumArtUrl: 'https://picsum.photos/128/128?random=23', spotifyUri: 'spotify:track:hindi3', previewUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav' },
  { id: '24', title: 'Surprised Hindi Track', artist: 'Unexpected Bollywood', album: 'Hindi Surprise', albumArtUrl: 'https://picsum.photos/128/128?random=24', spotifyUri: 'spotify:track:hindi4', previewUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav' },
  { id: '25', title: 'Fearful Hindi Tone', artist: 'Horror Bollywood', album: 'Hindi Fear', albumArtUrl: 'https://picsum.photos/128/128?random=25', spotifyUri: 'spotify:track:hindi5', previewUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav' },
  { id: '26', title: 'Disgusted Hindi Groove', artist: 'Bollywood Disgust', album: 'Hindi Ew', albumArtUrl: 'https://picsum.photos/128/128?random=26', spotifyUri: 'spotify:track:hindi6', previewUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav' },
  { id: '27', title: 'Neutral Hindi Tune', artist: 'Calm Bollywood', album: 'Hindi Peace', albumArtUrl: 'https://picsum.photos/128/128?random=27', spotifyUri: 'spotify:track:hindi7', previewUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav' },
];

export async function getRecommendations(
  mapping: EmotionMapping,
  discoveryMode: boolean
): Promise<Song[]> {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  // In a real scenario, you'd use mapping parameters to query Spotify's
  // `/recommendations` endpoint. For example:
  // `https://api.spotify.com/v1/recommendations?limit=10&seed_genres=${mapping.genres.join(',')}&target_valence=${avgValence}&target_energy=${avgEnergy}&target_tempo=${avgTempo}`
  // and handle OAuth token in headers.

  console.log("Mock Spotify: Generating recommendations for mapping:", mapping, "Discovery Mode:", discoveryMode);

  // Filter mock songs based on simplified "genre" matching for demonstration
  const filteredSongs = MOCK_SONGS.filter(song => {
    // This is a very simplistic filter. In reality, Spotify API would handle more complex filtering.
    const songGenreMatch = mapping.genres.some(genre => song.album.toLowerCase().includes(genre) || song.title.toLowerCase().includes(genre) || song.artist.toLowerCase().includes(genre));
    return songGenreMatch;
  });

  // If filtered songs are too few or none, fallback to some general songs
  const recommendedSongs = filteredSongs.length > 5 ? filteredSongs : MOCK_SONGS;

  // Shuffle and pick 10-20 songs
  const shuffled = recommendedSongs.sort(() => 0.5 - Math.random());
  const playlistSize = Math.floor(Math.random() * (20 - 10 + 1)) + 10; // 10 to 20 songs
  return shuffled.slice(0, playlistSize);
}

// Mock Spotify Authentication
export async function mockSpotifyAuth(): Promise<boolean> {
  // Simulate successful authentication after a delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  console.log("Mock Spotify: User authenticated successfully.");
  return true;
}
