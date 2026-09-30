import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { absoluteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const papers = await prisma.paper.findMany({
    where: { status: "PUBLISHED", accessLevel: "PUBLIC" },
    select: { slug: true, updatedAt: true },
    orderBy: { updatedAt: "desc" },
  });
  const browsePages: MetadataRoute.Sitemap = ["/", "/search", "/check-topic"].map((path) => ({
    url: absoluteUrl(path),
    lastModified: new Date(),
  }));
  return [
    ...browsePages,
    ...papers.map((paper) => ({
      url: absoluteUrl(`/papers/${paper.slug}`),
      lastModified: paper.updatedAt,
    })),
  ];
}
