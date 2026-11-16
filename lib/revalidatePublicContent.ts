import { revalidatePath, revalidateTag } from "next/cache";

export const revalidateNewsContent = (slugs: Array<string | null | undefined> = []) => {
  revalidateTag("news");
  revalidateTag("news:list");
  revalidatePath("/");
  revalidatePath("/newses");

  for (const slug of slugs) {
    if (!slug) continue;
    revalidateTag(`news:${slug}`);
    revalidatePath(`/news/${slug}`);
  }
};

export const revalidatePosterContent = () => {
  revalidateTag("posters");
  revalidatePath("/");
};

export const revalidatePublicationContent = (
  slugs: Array<string | null | undefined> = []
) => {
  revalidateTag("publications");
  revalidateTag("publications:list");
  revalidatePath("/publication");

  for (const slug of slugs) {
    if (!slug) continue;
    revalidateTag(`publication:${slug}`);
    revalidatePath(`/publication/${slug}`);
  }
};
