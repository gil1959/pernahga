import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://pernahga.com';

  const showcases = await prisma.showcase.findMany({
    where: { isPublished: true },
    select: { slug: true, updatedAt: true },
  });

  const showcaseUrls = showcases.map((item) => ({
    url: `${baseUrl}/showcase/${item.slug}`,
    lastModified: item.updatedAt,
  }));

  return [
    { url: `${baseUrl}`, lastModified: new Date() },
    { url: `${baseUrl}/services`, lastModified: new Date() },
    { url: `${baseUrl}/showcase`, lastModified: new Date() },
    { url: `${baseUrl}/education`, lastModified: new Date() },
    { url: `${baseUrl}/contact`, lastModified: new Date() },
    ...showcaseUrls,
  ];
}
