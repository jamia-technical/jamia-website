import prisma from "../../utils/prisma";

export const publicationService = {
  async getAllPublications(options?: { published?: boolean; limit?: number }) {
    return await prisma.publication.findMany({
      where: {
        ...(options?.published !== undefined
          ? { ispublished: options.published }
          : {}),
      },
      orderBy: options?.published
        ? [{ publishedat: "desc" }, { createdat: "desc" }]
        : { createdat: "desc" },
      ...(options?.limit ? { take: options.limit } : {}),
    });
  },

  async getPublicationCount() {
    return await prisma.publication.count();
  },

  async getPublicationById(id: string | number) {
    return await prisma.publication.findUnique({
      where: { id: typeof id === "string" ? parseInt(id) : id },
    });
  },

  async getPublicationBySlug(slug: string) {
    return await prisma.publication.findUnique({
      where: { slug },
    });
  },

  async createPublication(data: any) {
    const {
      title,
      description,
      issue,
      coverimage,
      coverimgid,
      pdfurl,
      pdfid,
      ispublished,
      publishedat,
      slug,
    } = data;

    return await prisma.publication.create({
      data: {
        title: title || "",
        description: description || "",
        issue: issue || "",
        coverimage: coverimage || "",
        coverimgid: coverimgid || "",
        pdfurl: pdfurl || "",
        pdfid: pdfid || "",
        ispublished: !!ispublished,
        publishedat: publishedat ? new Date(publishedat) : null,
        slug: slug || undefined,
      },
    });
  },

  async updatePublication(id: string | number, data: any) {
    const updateData: any = {};

    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.issue !== undefined) updateData.issue = data.issue;
    if (data.coverimage !== undefined) updateData.coverimage = data.coverimage;
    if (data.coverImage !== undefined) updateData.coverimage = data.coverImage;
    if (data.coverimgid !== undefined) updateData.coverimgid = data.coverimgid;
    if (data.coverImgId !== undefined) updateData.coverimgid = data.coverImgId;
    if (data.pdfurl !== undefined) updateData.pdfurl = data.pdfurl;
    if (data.pdfUrl !== undefined) updateData.pdfurl = data.pdfUrl;
    if (data.pdfid !== undefined) updateData.pdfid = data.pdfid;
    if (data.pdfId !== undefined) updateData.pdfid = data.pdfId;
    if (data.ispublished !== undefined) updateData.ispublished = !!data.ispublished;
    if (data.isPublished !== undefined) updateData.ispublished = !!data.isPublished;
    if (data.publishedat !== undefined) {
      updateData.publishedat = data.publishedat ? new Date(data.publishedat) : null;
    }
    if (data.publishedAt !== undefined) {
      updateData.publishedat = data.publishedAt ? new Date(data.publishedAt) : null;
    }
    if (data.slug !== undefined) updateData.slug = data.slug;

    return await prisma.publication.update({
      where: { id: typeof id === "string" ? parseInt(id) : id },
      data: updateData,
    });
  },

  async deletePublication(id: string | number) {
    return await prisma.publication.delete({
      where: { id: typeof id === "string" ? parseInt(id) : id },
    });
  },
};
