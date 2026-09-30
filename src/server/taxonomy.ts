import { prisma } from "@/lib/prisma";

export function getResearchAreas() {
  return prisma.researchArea.findMany({
    select: {
      id: true,
      nameTh: true,
      nameEn: true,
      slug: true,
      description: true,
      icon: true,
      _count: { select: { papers: { where: { status: "PUBLISHED" } } } },
    },
    orderBy: { nameTh: "asc" },
  });
}

export function getAdvisors() {
  return prisma.advisor.findMany({
    where: { isActive: true },
    select: { id: true, titleName: true, firstNameTh: true, lastNameTh: true, firstNameEn: true, lastNameEn: true },
    orderBy: [{ lastNameTh: "asc" }, { firstNameTh: "asc" }],
  });
}

export function getYears() {
  return prisma.paper.findMany({
    where: { status: "PUBLISHED" },
    distinct: ["academicYear"],
    select: { academicYear: true },
    orderBy: { academicYear: "desc" },
  }).then((rows) => rows.map((row) => row.academicYear));
}

export function getTopTechnologies(limit = 12) {
  return prisma.technology.findMany({
    select: { id: true, name: true, slug: true, category: true, _count: { select: { papers: { where: { paper: { status: "PUBLISHED" } } } } } },
    orderBy: { papers: { _count: "desc" } },
    take: limit,
  });
}
