import { getRandomPexelsVideo } from '@/app/actions/pexels-randomizer-action';
import { getRandomQuote } from '@/app/actions/quote-randomizer-action';
import { getRandomUnsplashImage } from '@/app/actions/unsplash-randomizer-action';
import { getRandomMusicTrack } from '@/services/free-music-service';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const quoteData = await getRandomQuote();

    // Choose a query for Unsplash/Pexels
    // Priority: First tag -> Author -> 'Abstract'
    let query = 'Nature';
    if (quoteData.tags && quoteData.tags.length > 0) {
      query = quoteData.tags[0];
    } else if (quoteData.author) {
      query = 'scenery';
    }

    // Parallel fetch for Image, Video, and Music
    const [imageResult, videoResult, musicResult] = await Promise.all([
      (async () => {
        try {
          return await getRandomUnsplashImage(query);
        } catch (e) {
          console.warn(`Failed to fetch image for query "${query}", falling back to "wallpaper"`);
          return await getRandomUnsplashImage('wallpaper');
        }
      })(),
      (async () => {
        try {
          let res = await getRandomPexelsVideo(query);
          if (!res) throw new Error("No video found");
          return res;
        } catch (e) {
          console.warn(`Failed to fetch video for query "${query}", falling back to "nature"`);
          return await getRandomPexelsVideo('nature');
        }
      })(),
      (async () => {
        try {
          return await getRandomMusicTrack('freesound');
        } catch (e) {
          console.warn('Failed to fetch music from Freesound');
          return null;
        }
      })()
    ]);

    return NextResponse.json({
      ...quoteData,
      backgroundUrl: imageResult.imageUrl, // Providing main URL here
      videoUrl: videoResult?.videoUrl || null,
      audioUrl: musicResult?.audioUrl || null,
      unsplashData: {
        urls: {
          regular: imageResult.imageUrl,
          full: imageResult.fullImageUrl,
          download: imageResult.downloadUrl
        },
        photographer: {
          name: imageResult.photographerName,
          url: imageResult.photographerUrl
        },
        alt: imageResult.alt
      },
      pexelsData: videoResult ? {
        videoUrl: videoResult.videoUrl,
        previewImage: videoResult.previewImage,
        duration: videoResult.duration,
        photographer: {
          name: videoResult.photographerName,
          url: videoResult.photographerUrl
        },
        originalUrl: videoResult.originalUrl
      } : null,
      freeSoundData: musicResult ? {
        audioUrl: musicResult.audioUrl,
        title: musicResult.title,
        artist: musicResult.artist,
        duration: musicResult.duration,
        license: musicResult.license,
        licenseUrl: musicResult.licenseUrl,
        source: musicResult.source,
      } : null,
    });

  } catch (error: any) {
    console.error("API Error in quote-randomizer:", error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch quote or background' },
      { status: 500 }
    );
  }
}
