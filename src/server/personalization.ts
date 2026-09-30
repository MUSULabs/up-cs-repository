import { prisma } from "@/lib/prisma";
import { formatBibtex } from "@/lib/citation";

export async function getUserBookmarks(userId: string) {
  return prisma.bookmark.findMany({
    where: { userId, paper: { status: "PUBLISHED" } },
    orderBy: { createdAt: "desc" },
    select: {
      note: true, createdAt: true,
      paper: {
        select: {
          id: true, slug: true, titleTh: true, titleEn: true, academicYear: true,
          researchArea: { select: { id: true, nameTh: true } },
          authors: { orderBy: { authorOrder: "asc" }, select: { author: { select: { firstNameTh: true, lastNameTh: true } } } },
        },
      },
    },
  });
}

export async function getBookmarkedPaperIds(userId: string, paperIds: string[]) {
  const rows = await prisma.bookmark.findMany({ where: { userId, paperId: { in: paperIds } }, select: { paperId: true } });
  return rows.map((row) => row.paperId);
}

export async function getSavedSearches(userId: string) {
  return prisma.savedSearch.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, select: { id: true, name: true, queryString: true, createdAt: true } });
}

export function exportBookmarksBibtex(bookmarks: Awaited<ReturnType<typeof getUserBookmarks>>) {
  return bookmarks.map(({ paper }) => formatBibtex({
    titleTh: paper.titleTh,
    titleEn: paper.titleEn,
    academicYear: paper.academicYear,
    authors: paper.authors.map(({ author }) => author),
  })).join("\n\n");
}
