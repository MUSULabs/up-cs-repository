"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/../auth";
import { prisma } from "@/lib/prisma";
import { adminPaperSchema } from "@/lib/validations";
import slugify from "slugify";

async function requireStudent() {
  const session = await auth();
  const email = session?.user?.email?.toLowerCase() ?? "";
  if (!session?.user?.id || !email.endsWith("@up.ac.th")) throw new Error("ต้องเข้าสู่ระบบด้วยอีเมล @up.ac.th");
  return session.user.id;
}

function parse(formData: FormData) {
  const ids = (key: string) => String(formData.get(key) ?? "").split(",").map((value) => value.trim()).filter(Boolean);
  const title = String(formData.get("titleTh") ?? "").trim();
  const raw = {
    slug: String(formData.get("slug") ?? "") || `${slugify(title, { lower: true, strict: true }) || "submission"}-${Date.now()}`,
    titleTh: title, titleEn: String(formData.get("titleEn") ?? "").trim() || undefined,
    abstractTh: String(formData.get("abstractTh") ?? "").trim(),
    abstractEn: String(formData.get("abstractEn") ?? "").trim() || undefined,
    academicYear: Number(formData.get("academicYear")), semester: Number(formData.get("semester")) || undefined,
    accessLevel: String(formData.get("accessLevel") ?? "AUTHENTICATED"), status: "DRAFT",
    researchAreaId: String(formData.get("researchAreaId") ?? ""),
    authorIds: ids("authorIds"), advisorIds: ids("advisorIds"), keywordIds: ids("keywordIds"), technologyIds: ids("technologyIds"),
  };
  return adminPaperSchema.parse(raw);
}

async function persist(id: string | undefined, userId: string, parsed: ReturnType<typeof parse>, status: "DRAFT" | "PENDING") {
  const data = { slug: parsed.slug, titleTh: parsed.titleTh, titleEn: parsed.titleEn, abstractTh: parsed.abstractTh, abstractEn: parsed.abstractEn, academicYear: parsed.academicYear, semester: parsed.semester, accessLevel: parsed.accessLevel, status, researchAreaId: parsed.researchAreaId, submittedById: userId, submittedAt: status === "PENDING" ? new Date() : undefined, rejectionReason: null };
  if (id) {
    const own = await prisma.paper.findFirst({ where: { id, submittedById: userId, status: { in: ["DRAFT", "REJECTED"] } }, select: { id: true } });
    if (!own) throw new Error("ไม่พบรายการที่แก้ไขได้");
    await prisma.$transaction([
      prisma.paper.update({ where: { id }, data }),
      prisma.paperAuthor.deleteMany({ where: { paperId: id } }), prisma.paperAdvisor.deleteMany({ where: { paperId: id } }),
      prisma.paperKeyword.deleteMany({ where: { paperId: id } }), prisma.paperTech.deleteMany({ where: { paperId: id } }),
      prisma.paperAuthor.createMany({ data: parsed.authorIds.map((authorId, authorOrder) => ({ paperId: id, authorId, authorOrder })) }),
      prisma.paperAdvisor.createMany({ data: parsed.advisorIds.map((advisorId, index) => ({ paperId: id, advisorId, role: index === 0 ? "MAIN" : "CO" })) }),
      prisma.paperKeyword.createMany({ data: parsed.keywordIds.map((keywordId) => ({ paperId: id, keywordId })) }),
      prisma.paperTech.createMany({ data: parsed.technologyIds.map((technologyId) => ({ paperId: id, technologyId })) }),
    ]);
    return id;
  }
  const created = await prisma.paper.create({ data: { ...data, authors: { create: parsed.authorIds.map((authorId, authorOrder) => ({ authorId, authorOrder })) }, advisors: { create: parsed.advisorIds.map((advisorId, index) => ({ advisorId, role: index === 0 ? "MAIN" : "CO" })) }, keywords: { create: parsed.keywordIds.map((keywordId) => ({ keywordId })) }, technologies: { create: parsed.technologyIds.map((technologyId) => ({ technologyId })) } }, select: { id: true } });
  return created.id;
}

export async function saveSubmission(formData: FormData) {
  const userId = await requireStudent();
  const parsed = parse(formData);
  const id = String(formData.get("id") ?? "") || undefined;
  const result = await persist(id, userId, parsed, "DRAFT");
  revalidatePath("/my/submissions");
  return { ok: true, id: result };
}

export async function submitSubmission(formData: FormData) {
  const userId = await requireStudent();
  if (formData.get("consent") !== "on") throw new Error("กรุณายอมรับเงื่อนไขการอนุญาตเผยแพร่ก่อนส่งตรวจ");
  const parsed = parse(formData);
  const id = String(formData.get("id") ?? "") || undefined;
  const result = await persist(id, userId, parsed, "PENDING");
  revalidatePath("/my/submissions"); revalidatePath("/admin/moderation");
  return { ok: true, id: result };
}

export async function getSubmissionForEdit(id: string) {
  const userId = await requireStudent();
  return prisma.paper.findFirst({ where: { id, submittedById: userId, status: { in: ["DRAFT", "REJECTED"] } }, select: { id: true, titleTh: true, titleEn: true, abstractTh: true, abstractEn: true, academicYear: true, semester: true, accessLevel: true, researchAreaId: true, authors: { select: { authorId: true } }, advisors: { select: { advisorId: true } }, keywords: { select: { keywordId: true } }, technologies: { select: { technologyId: true } } } });
}

export async function approveSubmission(id: string) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") throw new Error("ไม่มีสิทธิ์ผู้ดูแลระบบ");
  await prisma.paper.update({ where: { id, status: "PENDING" }, data: { status: "PUBLISHED", reviewedById: session.user.id, reviewedAt: new Date(), rejectionReason: null } });
  revalidatePath("/admin/moderation"); revalidatePath("/search"); revalidatePath("/");
}

export async function approveSubmissionWithEdits(formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") throw new Error("ไม่มีสิทธิ์ผู้ดูแลระบบ");
  const id = String(formData.get("id") ?? "");
  const ids = (key: string) => String(formData.get(key) ?? "").split(",").map((value) => value.trim()).filter(Boolean);
  const titleTh = String(formData.get("titleTh") ?? "").trim();
  const data = {
    titleTh,
    titleEn: String(formData.get("titleEn") ?? "").trim() || null,
    abstractTh: String(formData.get("abstractTh") ?? "").trim(),
    abstractEn: String(formData.get("abstractEn") ?? "").trim() || null,
    academicYear: Number(formData.get("academicYear")),
    semester: Number(formData.get("semester")) || null,
    accessLevel: String(formData.get("accessLevel") ?? "AUTHENTICATED") as "PUBLIC" | "AUTHENTICATED" | "DEPT_ONLY",
    researchAreaId: String(formData.get("researchAreaId") ?? ""),
  };
  if (!titleTh || !data.abstractTh || !data.researchAreaId) throw new Error("กรุณากรอกข้อมูลสำคัญให้ครบ");
  await prisma.$transaction([
    prisma.paper.update({ where: { id, status: "PENDING" }, data: { ...data, status: "PUBLISHED", reviewedById: session.user.id, reviewedAt: new Date(), rejectionReason: null } }),
    prisma.paperAuthor.deleteMany({ where: { paperId: id } }),
    prisma.paperAdvisor.deleteMany({ where: { paperId: id } }),
    prisma.paperKeyword.deleteMany({ where: { paperId: id } }),
    prisma.paperTech.deleteMany({ where: { paperId: id } }),
    prisma.paperAuthor.createMany({ data: ids("authorIds").map((authorId, authorOrder) => ({ paperId: id, authorId, authorOrder })) }),
    prisma.paperAdvisor.createMany({ data: ids("advisorIds").map((advisorId, index) => ({ paperId: id, advisorId, role: index === 0 ? "MAIN" : "CO" })) }),
    prisma.paperKeyword.createMany({ data: ids("keywordIds").map((keywordId) => ({ paperId: id, keywordId })) }),
    prisma.paperTech.createMany({ data: ids("technologyIds").map((technologyId) => ({ paperId: id, technologyId })) }),
  ]);
  revalidatePath("/admin/moderation"); revalidatePath("/search"); revalidatePath("/");
}

export async function rejectSubmission(formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") throw new Error("ไม่มีสิทธิ์ผู้ดูแลระบบ");
  const reason = String(formData.get("rejectionReason") ?? "").trim();
  if (!reason) throw new Error("กรุณาระบุเหตุผลที่ปฏิเสธ");
  await prisma.paper.update({ where: { id: String(formData.get("id")), status: "PENDING" }, data: { status: "REJECTED", reviewedById: session.user.id, reviewedAt: new Date(), rejectionReason: reason } });
  revalidatePath("/admin/moderation"); revalidatePath("/my/submissions");
}
