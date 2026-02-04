'use server';

import { z } from 'zod';

const VideoFileSchema = z.object({
  id: z.number(),
  quality: z.string().nullable(),
  file_type: z.string(),
  width: z.number().nullable(),
  height: z.number().nullable(),
  fps: z.number().nullable().optional(),
  link: z.string().url(),
});

const VideoSchema = z.object({
  id: z.number(),
  width: z.number(),
  height: z.number(),
  duration: z.number(),
  full_res: z.unknown().optional(),
  tags: z.array(z.unknown()).optional(),
  url: z.string(),
  image: z.string(),
  avg_color: z.unknown().optional(),
  user: z.object({
    id: z.number(),
    name: z.string(),
    url: z.string(),
  }),
  video_files: z.array(VideoFileSchema),
  video_pictures: z.array(z.unknown()).optional(),
});

const PexelsResponseSchema = z.object({
  page: z.number(),
  per_page: z.number(),
  videos: z.array(VideoSchema),
  total_results: z.number(),
  next_page: z.string().optional(),
  url: z.string().optional(),
});

export type PexelsVideoResult = {
  videoUrl: string;
  previewImage: string;
  duration: number;
  photographerName: string;
  photographerUrl: string;
  originalUrl: string;
};

const accessKey = process.env.PEXEL_API_KEY;

export async function getRandomPexelsVideo(query: string): Promise<PexelsVideoResult | null> {
  if (!accessKey) {
    console.error('PEXEL_API_KEY is not configured on the server.');
    return null;
  }

  const searchQuery = query.trim() === '' ? 'nature' : query;
  const apiUrl = new URL('https://api.pexels.com/videos/search');
  apiUrl.searchParams.append('query', searchQuery);
  apiUrl.searchParams.append('per_page', '15'); // Fetch more to pick random
  apiUrl.searchParams.append('orientation', 'landscape');

  try {
    const response = await fetch(apiUrl.toString(), {
      headers: {
        Authorization: accessKey,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error(`Pexels API error: ${response.status} ${response.statusText}`);
      return null;
    }

    const data = await response.json();
    const parsedData = PexelsResponseSchema.safeParse(data);

    if (!parsedData.success) {
      console.error('Pexels Zod validation error:', parsedData.error);
      return null;
    }

    const videos = parsedData.data.videos;
    if (videos.length === 0) return null;

    // Pick a random video from the results
    const randomVideo = videos[Math.floor(Math.random() * videos.length)];

    // Find a suitable video file (e.g., HD)
    // Priority: hd -> sd -> first available
    // note: quality can be 'hd', 'sd', 'hls'
    let videoFile = randomVideo.video_files.find((f) => f.quality === 'hd' && f.file_type === 'video/mp4');

    if (!videoFile) {
      videoFile = randomVideo.video_files.find((f) => f.quality === 'sd' && f.file_type === 'video/mp4');
    }

    // Fallback to any mp4
    if (!videoFile) {
      videoFile = randomVideo.video_files.find((f) => f.file_type === 'video/mp4');
    }

    if (!videoFile) {
      // If really no MP4?
      videoFile = randomVideo.video_files[0];
    }

    if (!videoFile) return null;

    return {
      videoUrl: videoFile.link,
      previewImage: randomVideo.image,
      duration: randomVideo.duration,
      photographerName: randomVideo.user.name,
      photographerUrl: randomVideo.user.url,
      originalUrl: randomVideo.url,
    };
  } catch (error) {
    console.error('Error fetching Pexels video:', error);
    return null;
  }
}
