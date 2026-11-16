import prisma from '../../utils/prisma'
import { NewsItem } from '../../types'

export const newsService = {
  async getAllNews(options?: { published?: boolean; category?: string; limit?: number }) {
    return await prisma.news.findMany({
      where: {
        ...(options?.published !== undefined ? { ispublished: options.published } : {}),
        ...(options?.category ? { category: options.category } : {}),
      },
      orderBy: options?.published
        ? [{ publishedat: 'desc' }, { createdat: 'desc' }]
        : { createdat: 'desc' },
      ...(options?.limit ? { take: options.limit } : {}),
    })
  },

  async getNewsCount() {
    return await prisma.news.count()
  },

  async getNewsById(id: string | number) {
    return await prisma.news.findUnique({
      where: { id: typeof id === 'string' ? parseInt(id) : id }
    })
  },

  async getNewsBySlug(slug: string) {
    return await prisma.news.findUnique({
      where: { slug }
    })
  },

  async createNews(data: any) {
    const { title, content, image, imgid, ispublished, publishedat, category, slug } = data;
    return await prisma.news.create({
      data: {
        title: title || '',
        content: content || '',
        image: image || '',
        imgid: imgid || '',
        ispublished: !!ispublished,
        publishedat: publishedat ? new Date(publishedat) : null,
        category: category || 'Events',
        slug: slug || undefined, // Let DB generate if not provided
      }
    })
  },

  async updateNews(id: string | number, data: any) {
    // Normalize data keys to match Prisma schema
    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.content !== undefined) updateData.content = data.content;
    if (data.image !== undefined) updateData.image = data.image;
    if (data.imgid !== undefined) updateData.imgid = data.imgid;
    if (data.imgId !== undefined) updateData.imgid = data.imgId;
    if (data.ispublished !== undefined) updateData.ispublished = !!data.ispublished;
    if (data.isPublished !== undefined) updateData.ispublished = !!data.isPublished;
    if (data.publishedat !== undefined) updateData.publishedat = data.publishedat ? new Date(data.publishedat) : null;
    if (data.publishedAt !== undefined) updateData.publishedat = data.publishedAt ? new Date(data.publishedAt) : null;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.slug !== undefined) updateData.slug = data.slug;

    return await prisma.news.update({
      where: { id: typeof id === 'string' ? parseInt(id) : id },
      data: updateData
    })
  },

  async deleteNews(id: string | number) {
    return await prisma.news.delete({
      where: { id: typeof id === 'string' ? parseInt(id) : id }
    })
  }
}
