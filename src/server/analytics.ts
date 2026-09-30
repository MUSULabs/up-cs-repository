import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export type AnalyticsRange = { from: Date; to: Date };

function rangeSql(range: AnalyticsRange) {
  return Prisma.sql`"createdAt" >= ${range.from} AND "createdAt" < ${range.to}`;
}

export async function getAdminAnalytics(range: AnalyticsRange) {
  const recentYearRows = await prisma.$queryRaw<Array<{ year: number }>>(Prisma.sql`
    SELECT DISTINCT "academicYear" AS year FROM "Paper"
    WHERE "status" = 'PUBLISHED' ORDER BY year DESC LIMIT 3
  `);
  const technologyYears = recentYearRows.map((row) => row.year).sort((a, b) => a - b);
  const thaiYear = new Date().getFullYear() + 543;
  const downloadsFrom = new Date(Math.max(range.from.getTime(), Date.now() - 30 * 24 * 60 * 60 * 1000));
  const downloadsTo = range.to;
  const [kpis, papersByYear, areas, technologies, advisors, mostDownloaded, mostViewed, downloadsOverTime] = await Promise.all([
    prisma.$queryRaw<Array<{ totalPapers: number; thisYearPapers: number; totalDownloads: number; uniqueVisitors: number }>>(Prisma.sql`
      SELECT
        (SELECT COUNT(*)::int FROM "Paper" WHERE "status" = 'PUBLISHED' AND ${rangeSql(range)}) AS "totalPapers",
        (SELECT COUNT(*)::int FROM "Paper" WHERE "status" = 'PUBLISHED' AND "academicYear" = ${thaiYear} AND ${rangeSql(range)}) AS "thisYearPapers",
        (SELECT COUNT(*)::int FROM "DownloadLog" WHERE ${rangeSql(range)}) AS "totalDownloads",
        (SELECT COUNT(DISTINCT "ipHash")::int FROM "DownloadLog" WHERE ${rangeSql(range)}) AS "uniqueVisitors"
    `),
    prisma.$queryRaw<Array<{ year: number; count: number }>>(Prisma.sql`
      SELECT "academicYear" AS year, COUNT(*)::int AS count
      FROM "Paper" WHERE "status" = 'PUBLISHED' AND ${rangeSql(range)}
      GROUP BY "academicYear" ORDER BY year
    `),
    prisma.$queryRaw<Array<{ name: string; count: number }>>(Prisma.sql`
      SELECT ra."nameTh" AS name, COUNT(p."id")::int AS count
      FROM "ResearchArea" ra JOIN "Paper" p ON p."researchAreaId" = ra."id"
      WHERE p."status" = 'PUBLISHED' AND p.${Prisma.raw('"createdAt"')} >= ${range.from} AND p.${Prisma.raw('"createdAt"')} < ${range.to}
      GROUP BY ra."id", ra."nameTh" ORDER BY count DESC
    `),
    prisma.$queryRaw<Array<{ name: string; year: number; count: number }>>(Prisma.sql`
      SELECT t."name", p."academicYear" AS year, COUNT(*)::int AS count
      FROM "Technology" t JOIN "PaperTech" pt ON pt."technologyId" = t."id"
      JOIN "Paper" p ON p."id" = pt."paperId"
      WHERE p."status" = 'PUBLISHED' AND p."academicYear" IN (${Prisma.join(technologyYears)})
        AND p.${Prisma.raw('"createdAt"')} >= ${range.from} AND p.${Prisma.raw('"createdAt"')} < ${range.to}
      GROUP BY t."id", t."name", p."academicYear"
      ORDER BY count DESC, t."name"
    `),
    prisma.$queryRaw<Array<{ advisor: string; year: number; count: number }>>(Prisma.sql`
      SELECT CONCAT(a."titleName", a."firstNameTh", ' ', a."lastNameTh") AS advisor,
        p."academicYear" AS year, COUNT(*)::int AS count
      FROM "Advisor" a JOIN "PaperAdvisor" pa ON pa."advisorId" = a."id"
      JOIN "Paper" p ON p."id" = pa."paperId"
      WHERE p."status" = 'PUBLISHED' AND p.${Prisma.raw('"createdAt"')} >= ${range.from} AND p.${Prisma.raw('"createdAt"')} < ${range.to}
      GROUP BY a."id", a."titleName", a."firstNameTh", a."lastNameTh", p."academicYear"
      ORDER BY advisor, year
    `),
    prisma.$queryRaw<Array<{ id: string; slug: string; title: string; downloads: number; views: number }>>(Prisma.sql`
      SELECT p."id", p."slug", p."titleTh" AS title, COUNT(dl."id")::int AS downloads, p."viewCount" AS views
      FROM "Paper" p LEFT JOIN "DownloadLog" dl ON dl."paperId" = p."id"
        AND dl."createdAt" >= ${range.from} AND dl."createdAt" < ${range.to}
      WHERE p."status" = 'PUBLISHED'
      GROUP BY p."id", p."slug", p."titleTh", p."viewCount"
      ORDER BY downloads DESC, views DESC LIMIT 10
    `),
    prisma.$queryRaw<Array<{ id: string; slug: string; title: string; downloads: number; views: number }>>(Prisma.sql`
      SELECT "id", "slug", "titleTh" AS title, "downloadCount" AS downloads, "viewCount" AS views
      FROM "Paper" WHERE "status" = 'PUBLISHED' AND ${rangeSql(range)}
      ORDER BY "viewCount" DESC, "downloadCount" DESC LIMIT 10
    `),
    prisma.$queryRaw<Array<{ date: string; count: number }>>(Prisma.sql`
      SELECT TO_CHAR(DATE_TRUNC('day', "createdAt"), 'YYYY-MM-DD') AS date, COUNT(*)::int AS count
      FROM "DownloadLog"
      WHERE "createdAt" >= ${downloadsFrom} AND "createdAt" < ${downloadsTo}
      GROUP BY DATE_TRUNC('day', "createdAt") ORDER BY date
    `),
  ]);

  const latestTech = new Map<string, { name: string; years: Record<string, number> }>();
  for (const row of technologies) {
    const item = latestTech.get(row.name) ?? { name: row.name, years: {} };
    item.years[String(row.year)] = row.count;
    latestTech.set(row.name, item);
  }
  return {
    range,
    kpis: kpis[0] ?? { totalPapers: 0, thisYearPapers: 0, totalDownloads: 0, uniqueVisitors: 0 },
    papersByYear,
    areas,
    technologies: [...latestTech.values()].sort((a, b) => Object.values(b.years).reduce((x, y) => x + y, 0) - Object.values(a.years).reduce((x, y) => x + y, 0)).slice(0, 10),
    technologyYears,
    advisors,
    mostDownloaded,
    mostViewed,
    downloadsOverTime,
  };
}

export async function getPublicStats() {
  const [papersByYear, areas, technologies] = await Promise.all([
    prisma.$queryRaw<Array<{ year: number; count: number }>>(Prisma.sql`
      SELECT "academicYear" AS year, COUNT(*)::int AS count FROM "Paper"
      WHERE "status" = 'PUBLISHED' GROUP BY "academicYear" ORDER BY year
    `),
    prisma.$queryRaw<Array<{ name: string; count: number }>>(Prisma.sql`
      SELECT ra."nameTh" AS name, COUNT(p."id")::int AS count
      FROM "ResearchArea" ra JOIN "Paper" p ON p."researchAreaId" = ra."id"
      WHERE p."status" = 'PUBLISHED' GROUP BY ra."id", ra."nameTh" ORDER BY count DESC
    `),
    prisma.$queryRaw<Array<{ name: string; count: number }>>(Prisma.sql`
      SELECT t."name", COUNT(*)::int AS count FROM "Technology" t
      JOIN "PaperTech" pt ON pt."technologyId" = t."id"
      JOIN "Paper" p ON p."id" = pt."paperId"
      WHERE p."status" = 'PUBLISHED'
      GROUP BY t."id", t."name" ORDER BY count DESC LIMIT 15
    `),
  ]);
  return { papersByYear, areas, technologies };
}
