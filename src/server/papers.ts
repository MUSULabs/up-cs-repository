import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { sanitizePaper } from "@/lib/access";
import { searchParamsSchema, type SearchParams } from "@/lib/validations";

const paperListSelect = {
  id: true,
  slug: true,
  titleTh: true,
  titleEn: true,
  abstractTh: true,
  abstractEn: true,
  academicYear: true,
  semester: true,
  pdfUrl: true,
  pdfPageCount: true,
  pdfSizeBytes: true,
  coverImageUrl: true,
  accessLevel: true,
  status: true,
  viewCount: true,
  downloadCount: true,
  createdAt: true,
  updatedAt: true,
  researchArea: { select: { id: true, nameTh: true, nameEn: true, slug: true } },
  authors: {
    orderBy: { authorOrder: "asc" as const },
    select: {
      authorOrder: true,
      author: {
        select: {
          id: true,
          firstNameTh: true,
          lastNameTh: true,
          firstNameEn: true,
          lastNameEn: true,
        },
      },
    },
  },
  advisors: {
    select: {
      role: true,
      advisor: {
        select: {
          id: true,
          titleName: true,
          firstNameTh: true,
          lastNameTh: true,
          firstNameEn: true,
          lastNameEn: true,
        },
      },
    },
  },
  keywords: {
    select: { keyword: { select: { id: true, nameTh: true, nameEn: true, slug: true } } },
  },
  technologies: {
    select: { technology: { select: { id: true, name: true, slug: true, category: true } } },
  },
} satisfies Prisma.PaperSelect;

export type PaperListItem = Prisma.PaperGetPayload<{ select: typeof paperListSelect }>;

type SearchQueryInput = SearchParams & { pageSize?: number };

export function buildPaperSearchQuery(input: SearchQueryInput): Prisma.Sql {
  const pageSize = input.pageSize ?? 12;
  const offset = (input.page - 1) * pageSize;
  const filters: Prisma.Sql[] = [Prisma.sql`p."status" = 'PUBLISHED'`];

  if (input.q) {
    const pattern = `%${input.q}%`;
    filters.push(Prisma.sql`(
      p."titleTh" ILIKE ${pattern}
      OR p."titleEn" ILIKE ${pattern}
      OR p."abstractTh" ILIKE ${pattern}
    )`);
  }
  if (input.year) filters.push(Prisma.sql`p."academicYear" = ${input.year}`);
  if (input.areaSlug) {
    filters.push(Prisma.sql`EXISTS (
      SELECT 1 FROM "ResearchArea" ra
      WHERE ra."id" = p."researchAreaId" AND ra."slug" = ${input.areaSlug}
    )`);
  }
  if (input.advisorId) {
    filters.push(Prisma.sql`EXISTS (
      SELECT 1 FROM "PaperAdvisor" pa
      WHERE pa."paperId" = p."id" AND pa."advisorId" = ${input.advisorId}
    )`);
  }
  if (input.techSlug) {
    filters.push(Prisma.sql`EXISTS (
      SELECT 1 FROM "PaperTech" pt
      JOIN "Technology" tech ON tech."id" = pt."technologyId"
      WHERE pt."paperId" = p."id" AND tech."slug" = ${input.techSlug}
    )`);
  }
  if (input.keyword) {
    filters.push(Prisma.sql`EXISTS (
      SELECT 1 FROM "PaperKeyword" pk
      JOIN "Keyword" kw ON kw."id" = pk."keywordId"
      WHERE pk."paperId" = p."id" AND kw."slug" = ${input.keyword}
    )`);
  }
  if (input.accessLevel) {
    filters.push(Prisma.sql`p."accessLevel" = ${input.accessLevel}`);
  }

  const relevance = input.q
    ? Prisma.sql`GREATEST(
        similarity(COALESCE(p."titleTh", ''), ${input.q}),
        similarity(COALESCE(p."titleEn", ''), ${input.q}),
        similarity(COALESCE(p."abstractTh", ''), ${input.q})
      ) DESC,`
    : Prisma.empty;
  const ordering =
    (input.q && input.sort === "relevance") || input.sort === "newest"
      ? Prisma.sql`${relevance} p."createdAt" DESC`
      : Prisma.sql`p."downloadCount" DESC, p."createdAt" DESC`;

  return Prisma.sql`
    SELECT p."id", COUNT(*) OVER()::int AS "totalCount"
    FROM "Paper" p
    WHERE ${Prisma.join(filters, " AND ")}
    ORDER BY ${ordering}
    LIMIT ${pageSize} OFFSET ${offset}
  `;
}

export async function searchPapers(input: SearchParams) {
  const params = searchParamsSchema.parse(input);
  const pageSize = 20;
  const rows = await prisma.$queryRaw<Array<{ id: string; totalCount: number }>>(
    buildPaperSearchQuery({ ...params, pageSize }),
  );
  const total = rows[0]?.totalCount ?? 0;
  const records = await prisma.paper.findMany({ where: { id: { in: rows.map((row) => row.id) } }, select: paperListSelect });
  const byId = new Map(records.map((record) => [record.id, record]));

  const [yearFacets, areaFacets, advisorFacets, techFacets, accessFacets] = await Promise.all([
    prisma.paper.groupBy({ by: ["academicYear"], where: { status: "PUBLISHED" }, _count: { _all: true }, orderBy: { academicYear: "desc" } }),
    prisma.researchArea.findMany({ select: { slug: true, nameTh: true, _count: { select: { papers: { where: { status: "PUBLISHED" } } } } }, orderBy: { nameTh: "asc" } }),
    prisma.advisor.findMany({ select: { id: true, firstNameTh: true, lastNameTh: true, _count: { select: { papers: { where: { paper: { status: "PUBLISHED" } } } } } }, where: { isActive: true, ...(params.advisorQ ? { OR: [{ firstNameTh: { contains: params.advisorQ } }, { lastNameTh: { contains: params.advisorQ } }] } : {}) }, orderBy: { lastNameTh: "asc" } }),
    prisma.technology.findMany({ select: { slug: true, name: true, _count: { select: { papers: { where: { paper: { status: "PUBLISHED" } } } } } }, orderBy: { name: "asc" } }),
    prisma.paper.groupBy({ by: ["accessLevel"], where: { status: "PUBLISHED" }, _count: { _all: true } }),
  ]);

  return {
    items: rows.flatMap((row) => {
      const item = byId.get(row.id);
      return item ? [sanitizePaper(item)] : [];
    }),
    total,
    totalPages: Math.ceil(total / pageSize),
    facetCounts: {
      years: yearFacets.map((facet) => ({ year: facet.academicYear, count: facet._count._all })),
      areas: areaFacets.map((facet) => ({ slug: facet.slug, nameTh: facet.nameTh, count: facet._count.papers })),
      advisors: advisorFacets.map((facet) => ({ id: facet.id, name: `${facet.firstNameTh} ${facet.lastNameTh}`, count: facet._count.papers })),
      technologies: techFacets.map((facet) => ({ slug: facet.slug, name: facet.name, count: facet._count.papers })),
      accessLevels: accessFacets.map((facet) => ({ level: facet.accessLevel, count: facet._count._all })),
    },
  };
}

export async function getPaperBySlug(slug: string) {
  const paper = await prisma.paper.findFirst({ where: { slug, status: "PUBLISHED" }, select: paperListSelect });
  return paper ? sanitizePaper(paper) : null;
}

export async function getRelatedPapers(paperId: string) {
  const paper = await prisma.paper.findUnique({ where: { id: paperId }, select: { researchAreaId: true } });
  if (!paper) return [];
  const records = await prisma.paper.findMany({
    where: { researchAreaId: paper.researchAreaId, id: { not: paperId }, status: "PUBLISHED" },
    orderBy: { createdAt: "desc" },
    take: 4,
    select: paperListSelect,
  });
  return records.map(sanitizePaper);
}

export async function getHomeStats() {
  const [paperCount, authorCount, advisorCount, downloadCount, yearRange] = await Promise.all([
    prisma.paper.count({ where: { status: "PUBLISHED" } }),
    prisma.author.count({ where: { papers: { some: { paper: { status: "PUBLISHED" } } } } }),
    prisma.advisor.count({ where: { papers: { some: { paper: { status: "PUBLISHED" } } } } }),
    prisma.paper.aggregate({ where: { status: "PUBLISHED" }, _sum: { downloadCount: true } }),
    prisma.paper.aggregate({ where: { status: "PUBLISHED" }, _min: { academicYear: true }, _max: { academicYear: true } }),
  ]);
  return { totalPapers: paperCount, authors: authorCount, advisors: advisorCount, downloads: downloadCount._sum.downloadCount ?? 0, yearsCovered: { from: yearRange._min.academicYear, to: yearRange._max.academicYear } };
}

export async function incrementViewCount(paperId: string) {
  return prisma.paper.update({ where: { id: paperId }, data: { viewCount: { increment: 1 } }, select: { id: true, viewCount: true } });
}

export async function getLatestPapers(limit = 8) {
  const records = await prisma.paper.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: paperListSelect,
  });
  return records.map(sanitizePaper);
}
