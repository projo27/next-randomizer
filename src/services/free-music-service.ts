"use server";

import { USER_AGENT } from "@/lib/utils";
import { z } from "zod";

// --- Type Definitions ---

export type MusicSource = 'all' | 'jamendo' | 'freesound' | 'fma';

const MusicTrackSchema = z.object({
  id: z.string(),
  title: z.string(),
  artist: z.string(),
  audioUrl: z.string().url(),
  coverArtUrl: z.string().url().optional(),
  duration: z.number().optional(),
  license: z.string().optional(),
  licenseUrl: z.string().url().optional(),
  source: z.enum(['jamendo', 'freesound', 'fma']),
});

export type MusicTrack = z.infer<typeof MusicTrackSchema>;

// --- Jamendo API ---

const JAMENDO_CLIENT_ID = process.env.JAMENDO_CLIENT_ID; // Public client ID for testing

interface JamendoTrack {
  id: string;
  name: string;
  artist_name: string;
  audio: string;
  image: string;
  duration: number;
  license_ccurl: string;
}

async function getRandomJamendoTrack(): Promise<MusicTrack | null> {
  try {
    // Get random offset between 0-1000 to randomize results
    const randomOffset = Math.floor(Math.random() * 1000);

    const url = `https://api.jamendo.com/v3.0/tracks/?client_id=${JAMENDO_CLIENT_ID}&format=json&limit=1&offset=${randomOffset}&include=musicinfo&audioformat=mp32`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': USER_AGENT,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Jamendo API error: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      return null;
    }

    const track: JamendoTrack = data.results[0];

    return {
      id: track.id,
      title: track.name,
      artist: track.artist_name,
      audioUrl: track.audio,
      coverArtUrl: track.image || undefined,
      duration: track.duration,
      license: "Creative Commons",
      licenseUrl: track.license_ccurl,
      source: 'jamendo',
    };
  } catch (error) {
    console.error('Error fetching from Jamendo:', error);
    return null;
  }
}

// --- Freesound API ---

const FREESOUND_API_KEY = process.env.FREESOUND_API_KEY;

interface FreesoundResult {
  id: number;
  name: string;
  username: string;
  previews: {
    'preview-hq-mp3': string;
    'preview-lq-mp3': string;
  };
  images: {
    spectral_m?: string;
    waveform_m?: string;
  };
  duration: number;
  license: string;
}

async function getRandomFreesoundTrack(): Promise<MusicTrack | null> {
  if (!FREESOUND_API_KEY) {
    console.warn('Freesound API key not configured');
    return null;
  }

  try {
    // Search for music-related sounds with minimum duration
    const queries = ['music', 'melody', 'loop', 'beat', 'song', 'lofi', 'instrumental', 'background', 'chill', 'ambient', 'cinematic', 'orchestra'];
    const randomQuery = queries[Math.floor(Math.random() * queries.length)];
    const randomPage = Math.floor(Math.random() * 10) + 1;

    const url = `https://freesound.org/apiv2/search/text/?query=${randomQuery}&filter=duration:[30 TO *] type:mp3&fields=id,name,username,previews,images,duration,license&page=${randomPage}&page_size=1`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Token ${FREESOUND_API_KEY}`,
        'User-Agent': USER_AGENT,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Freesound API error: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      return null;
    }

    const sound: FreesoundResult = data.results[0];

    return {
      id: sound.id.toString(),
      title: sound.name,
      artist: sound.username,
      audioUrl: sound.previews['preview-hq-mp3'] || sound.previews['preview-lq-mp3'],
      coverArtUrl: sound.images?.spectral_m || sound.images?.waveform_m || undefined,
      duration: sound.duration,
      license: sound.license,
      licenseUrl: `https://freesound.org/people/${sound.username}/sounds/${sound.id}/`,
      source: 'freesound',
    };
  } catch (error) {
    console.error('Error fetching from Freesound:', error);
    return null;
  }
}

// --- Free Music Archive API ---

interface FMATrack {
  track_id: string;
  track_title: string;
  artist_name: string;
  track_image_file?: string;
  track_duration?: string;
  license_title?: string;
  track_url: string;
  track_file_url?: string;
}

async function getRandomFMATrack(): Promise<MusicTrack | null> {
  try {
    // FMA API is deprecated, but we can try the legacy endpoint
    // Note: This might not work without proper authentication
    const randomPage = Math.floor(Math.random() * 50) + 1;
    const url = `https://freemusicarchive.org/api/get/tracks.json?limit=1&page=${randomPage}`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': USER_AGENT,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      console.warn('FMA API not available');
      return null;
    }

    const data = await response.json();

    if (!data.dataset || data.dataset.length === 0) {
      return null;
    }

    const track: FMATrack = data.dataset[0];

    // FMA requires download URLs which may not be directly accessible
    if (!track.track_file_url) {
      return null;
    }

    return {
      id: track.track_id,
      title: track.track_title,
      artist: track.artist_name,
      audioUrl: track.track_file_url,
      coverArtUrl: track.track_image_file || undefined,
      duration: track.track_duration ? parseFloat(track.track_duration) : undefined,
      license: track.license_title || "Creative Commons",
      licenseUrl: track.track_url,
      source: 'fma',
    };
  } catch (error) {
    console.error('Error fetching from FMA:', error);
    return null;
  }
}

// --- Main Export Function ---

export async function getRandomMusicTrack(source: MusicSource): Promise<MusicTrack> {
  let selectedSource: Exclude<MusicSource, 'all'>;

  if (source === 'all') {
    // Randomly select one of the available sources
    const availableSources: Exclude<MusicSource, 'all'>[] = ['jamendo', 'freesound', 'fma'];
    selectedSource = availableSources[Math.floor(Math.random() * availableSources.length)];
  } else {
    selectedSource = source;
  }

  let track: MusicTrack | null = null;
  let attempts = 0;
  const maxAttempts = 3;

  // Try to fetch from selected source, with fallback to other sources
  while (!track && attempts < maxAttempts) {
    switch (selectedSource) {
      case 'jamendo':
        track = await getRandomJamendoTrack();
        if (!track) selectedSource = 'freesound';
        break;
      case 'freesound':
        track = await getRandomFreesoundTrack();
        if (!track) selectedSource = 'fma';
        break;
      case 'fma':
        track = await getRandomFMATrack();
        if (!track) selectedSource = 'jamendo';
        break;
    }
    attempts++;
  }

  if (!track) {
    throw new Error('Could not fetch music from any source. Please try again.');
  }

  return track;
}
