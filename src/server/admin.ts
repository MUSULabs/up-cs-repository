import { prisma } from "@/lib/prisma";

export async function getAdminDashboard() {
  const [counts, byYear, recent, downloaded] = await Promise.all([
    Promise.all([
      prisma.paper.count({ where: { status: "PUBLISHED" } }),
      prisma.paper.count({ where: { status: "DRAFT" } }),
      prisma.paper.count({ where: { status: "ARCHIVED" } }),
      prisma.user.count(),
    ]),
    prisma.paper.groupBy({ by: ["academicYear"], _count: { _all: true }, orderBy: { academicYear: "asc" } }),
    prisma.paper.findMany({ orderBy: { createdAt: "desc" }, take: 8, select: { id: true, slug: true, titleTh: true, academicYear: true, status: true, createdAt: true } }),
    prisma.paper.findMany({ where: { status: "PUBLISHED" }, orderBy: { downloadCount: "desc" }, take: 10, select: { id: true, slug: true, titleTh: true, downloadCount: true, academicYear: true } }),
  ]);
  return { counts: { published: counts[0], draft: counts[1], archived: counts[2], users: counts[3] }, byYear: byYear.map((row) => ({ year: row.academicYear, count: row._count._all })), recent, downloaded };
}

export async function getAdminPapers(input: { q?: string; status?: "DRAFT" | "PUBLISHED" | "ARCHIVED"; year?: number; accessLevel?: "PUBLIC" | "AUTHENTICATED" | "DEPT_ONLY"; page?: number; sort?: "newest" | "downloads" }) {
  const page = input.page ?? 1;
  const take = 20;
  const where = {
    ...(input.q ? { OR: [{ titleTh: { contains: input.q } }, { titleEn: { contains: input.q } }] } : {}),
    ...(input.status ? { status: input.status } : {}),
    ...(input.year ? { academicYear: input.year } : {}),
    ...(input.accessLevel ? { accessLevel: input.accessLevel } : {}),
  };
  const [items, total] = await Promise.all([
    prisma.paper.findMany({
      where, skip: (page - 1) * take, take,
      orderBy: input.sort === "downloads" ? { downloadCount: "desc" } : { createdAt: "desc" },
      select: { id: true, slug: true, titleTh: true, academicYear: true, accessLevel: true, status: true, downloadCount: true, updatedAt: true },
    }),
    prisma.paper.count({ where }),
  ]);
  return { items, total, totalPages: Math.ceil(total / take) };
}

export function getAdminPaper(id: string) {
  return prisma.paper.findUnique({
    where: { id },
    select: {
      id: true, slug: true, titleTh: true, titleEn: true, abstractTh: true, abstractEn: true,
      academicYear: true, semester: true, pdfUrl: true, pdfPageCount: true, pdfSizeBytes: true,
      coverImageUrl: true, accessLevel: true, status: true, researchAreaId: true,
      authors: { orderBy: { authorOrder: "asc" }, select: { author: { select: { id: true, firstNameTh: true, lastNameTh: true } } } },
      advisors: { select: { role: true, advisor: { select: { id: true, titleName: true, firstNameTh: true, lastNameTh: true } } } },
      keywords: { select: { keyword: { select: { id: true, nameTh: true } } } },
      technologies: { select: { technology: { select: { id: true, name: true } } } },
    },
  });
}

export function getAdminOptions() {
  return Promise.all([
    prisma.researchArea.findMany({ select: { id: true, nameTh: true }, orderBy: { nameTh: "asc" } }),
    prisma.author.findMany({ select: { id: true, firstNameTh: true, lastNameTh: true }, orderBy: { lastNameTh: "asc" } }),
    prisma.advisor.findMany({ where: { isActive: true }, select: { id: true, titleName: true, firstNameTh: true, lastNameTh: true }, orderBy: { lastNameTh: "asc" } }),
    prisma.keyword.findMany({ select: { id: true, nameTh: true }, orderBy: { nameTh: "asc" } }),
    prisma.technology.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);
}

export function getAdminUsers() {
  return prisma.user.findMany({ select: { id: true, email: true, name: true, role: true, emailVerified: true, createdAt: true }, orderBy: { createdAt: "desc" } });
}
