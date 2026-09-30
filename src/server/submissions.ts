import { prisma } from "@/lib/prisma";

const submissionSelect = {
  id: true, slug: true, titleTh: true, titleEn: true, abstractTh: true, abstractEn: true,
  academicYear: true, semester: true, accessLevel: true, status: true, rejectionReason: true,
  submittedAt: true, reviewedAt: true, researchArea: { select: { id: true, nameTh: true } },
  authors: { orderBy: { authorOrder: "asc" as const }, select: { author: { select: { id: true, firstNameTh: true, lastNameTh: true } } } },
  advisors: { select: { role: true, advisor: { select: { id: true, titleName: true, firstNameTh: true, lastNameTh: true } } } },
  keywords: { select: { keyword: { select: { id: true, nameTh: true } } } },
  technologies: { select: { technology: { select: { id: true, name: true } } } },
} as const;

export function getUserSubmissions(userId: string) {
  return prisma.paper.findMany({ where: { submittedById: userId }, orderBy: { updatedAt: "desc" }, select: submissionSelect });
}

export function getModerationQueue() {
  return prisma.paper.findMany({ where: { status: "PENDING" }, orderBy: { submittedAt: "asc" }, select: submissionSelect });
}

export function getModerationPaper(id: string) {
  return prisma.paper.findFirst({ where: { id, status: "PENDING" }, select: submissionSelect });
}
