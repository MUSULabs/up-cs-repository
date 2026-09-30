import { z } from "zod";

export const authorSchema = z.object({
  firstNameTh: z.string().trim().min(1),
  lastNameTh: z.string().trim().min(1),
  firstNameEn: z.string().trim().optional(),
  lastNameEn: z.string().trim().optional(),
  studentId: z.string().trim().optional(),
  email: z.email().optional(),
});

export const advisorSchema = z.object({
  titleName: z.string().trim().min(1),
  firstNameTh: z.string().trim().min(1),
  lastNameTh: z.string().trim().min(1),
  firstNameEn: z.string().trim().optional(),
  lastNameEn: z.string().trim().optional(),
  email: z.email().optional(),
  isActive: z.boolean().default(true),
});

export const paperSchema = z.object({
  slug: z.string().trim().min(1),
  titleTh: z.string().trim().min(1),
  titleEn: z.string().trim().optional(),
  abstractTh: z.string().trim().min(1),
  abstractEn: z.string().trim().optional(),
  academicYear: z.number().int().min(2400).max(3000),
  semester: z.number().int().min(1).max(3).optional(),
  pdfUrl: z.url().optional(),
  pdfPageCount: z.number().int().positive().optional(),
  pdfSizeBytes: z.number().int().positive().optional(),
  coverImageUrl: z.url().optional(),
  accessLevel: z.enum(["PUBLIC", "AUTHENTICATED", "DEPT_ONLY"]).default("PUBLIC"),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("PUBLISHED"),
  researchAreaId: z.string().cuid(),
});

export const searchParamsSchema = z.object({
  q: z.string().trim().max(200).optional(),
  year: z.coerce.number().int().optional(),
  areaSlug: z.string().trim().optional(),
  advisorId: z.string().trim().optional(),
  techSlug: z.string().trim().optional(),
  keyword: z.string().trim().optional(),
  accessLevel: z.enum(["PUBLIC", "AUTHENTICATED", "DEPT_ONLY"]).optional(),
  advisorQ: z.string().trim().max(100).optional(),
  sort: z.enum(["relevance", "newest", "most-downloaded"]).default("newest"),
  page: z.coerce.number().int().min(1).default(1),
});

export const adminPaperSchema = paperSchema.extend({
  authorIds: z.array(z.string().cuid()).default([]),
  advisorIds: z.array(z.string().cuid()).default([]),
  keywordIds: z.array(z.string().cuid()).default([]),
  technologyIds: z.array(z.string().cuid()).default([]),
});

export const roleSchema = z.enum(["VIEWER", "DEPT_MEMBER", "ADMIN"]);

export type SearchParams = z.infer<typeof searchParamsSchema>;
