'use server';

export interface MusicBrainzRecording {
  id: string;
  title: string;
  'artist-credit': { artist: { name: string } }[];
  releases: { id: string; title: string; 'release-group': { 'primary-type': string } }[];
  'first-release-date'?: string;
  relations?: {
    type: string;
    artist?: { name: string };
  }[];
}

export interface CoverArtArchiveResponse {
  images: {
    image: string;
    thumbnails: {
      small: string;
      large: string;
    };
  }[];
}

export interface MusicResult {
  title: string;
  artist: string;
  album: string | null;
  composers: string[];
  releaseDate: string | null;
  coverArtUrl: string | null;
  spotifyUrl: string | null;
  youtubeUrl: string | null;
}

const MUSICBRAINZ_API_URL = 'https://musicbrainz.org/ws/2';
const COVERART_API_URL = 'https://coverartarchive.org';

const COMMON_SEARCH_TERMS = ['love', 'life', 'time', 'world', 'day', 'night', 'sun', 'rain', 'fire', 'water', 'sky', 'heart', 'dream'];

async function fetchRandomRecording(): Promise<MusicBrainzRecording | null> {
  // MusicBrainz doesn't have a random endpoint, so we search for a common term with a random offset
  const randomTerm = COMMON_SEARCH_TERMS[Math.floor(Math.random() * COMMON_SEARCH_TERMS.length)];
  const randomOffset = Math.floor(Math.random() * 500); // Get a random page of results

  const url = `${MUSICBRAINZ_API_URL}/recording/?query=${randomTerm}&fmt=json&limit=100&offset=${randomOffset}`;

  const response = await fetch(url, {
    headers: {
      'Accept': 'application/json',
      // MusicBrainz API requires a user-agent
      'User-Agent': 'Randomizer.fun/1.0.0 ( support@randomizer.fun )'
    }
  });

  if (!response.ok) {
    console.error('MusicBrainz API error:', response.status, await response.text());
    throw new Error('Failed to fetch data from MusicBrainz API.');
  }

  const data = await response.json();
  if (!data.recordings || data.recordings.length === 0) {
    return null;
  }

  // Pick a random recording from the fetched list
  const randomRecording = data.recordings[Math.floor(Math.random() * data.recordings.length)];
  return randomRecording;
}

async function getCoverArt(releaseId: string): Promise<string | null> {
  try {
    const url = `${COVERART_API_URL}/release/${releaseId}`;
    const response = await fetch(url, { headers: { 'Accept': 'application/json' } });

    if (!response.ok) {
        return null;
    }
    const data: CoverArtArchiveResponse = await response.json();
    return data.images?.[0]?.thumbnails?.large || data.images?.[0]?.image || null;
  } catch (error) {
    console.warn(`Could not fetch cover art for release ${releaseId}:`, error);
    return null;
  }
}

export async function getRandomMusic(): Promise<MusicResult | null> {
  const recording = await fetchRandomRecording();
  if (!recording) {
    return null;
  }
  
  const artist = recording['artist-credit']?.[0]?.artist?.name || 'Unknown Artist';
  const release = recording.releases?.[0];
  const album = release?.title || 'Single';

  let coverArtUrl: string | null = null;
  if(release?.id) {
    coverArtUrl = await getCoverArt(release.id);
  }

  const composers = recording.relations
    ?.filter(rel => rel.type === 'composer')
    .map(rel => rel.artist?.name)
    .filter((name): name is string => !!name) || [];

  const spotifyUrl = `https://open.spotify.com/search/${encodeURIComponent(`${recording.title} ${artist}`)}`;
  const youtubeUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(`${recording.title} ${artist}`)}`;


  return {
    title: recording.title,
    artist,
    album,
    composers: [...new Set(composers)], // Remove duplicates
    releaseDate: recording['first-release-date'] || null,
    coverArtUrl,
    spotifyUrl,
    youtubeUrl,
  };
}
