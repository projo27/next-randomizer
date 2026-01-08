// src/app/sitemap.xml/route.ts
import { triggerList } from '@/lib/menu-data';

const URL = 'https://randomizer.fun';

function generateSitemap() {
  const staticPages = [
    '', // Homepage
    '/about',
    '/privacy',
    '/terms',
    '/setting'
  ].map((path) => ({
    url: `${URL}${path}`,
    lastModified: new Date().toISOString(),
  }));

  const toolPages = triggerList.map((tool) => ({
    url: `${URL}/tool/${tool.value}`,
    lastModified: new Date().toISOString(),
  }));

  const allPages = [...staticPages, ...toolPages];

  return `<?xml version="1.0" encoding="UTF-8"?>
   <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
     ${allPages
      .map(({ url, lastModified }) => {
        return `
           <url>
               <loc>${url}</loc>
               <lastmod>${lastModified}</lastmod>
               <changefreq>weekly</changefreq>
               <priority>0.8</priority>
           </url>
         `;
      })
      .join('')}
   </urlset>
 `;
}

export async function GET() {
  const body = generateSitemap();

  return new Response(body, {
    status: 200,
    headers: {
      'Cache-control': 'public, s-maxage=86400, stale-while-revalidate',
      'content-type': 'application/xml',
    },
  });
}
