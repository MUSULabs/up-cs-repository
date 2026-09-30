"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/../auth";
import { prisma } from "@/lib/prisma";
import { adminPaperSchema, roleSchema } from "@/lib/validations";
import { storage } from "@/lib/storage";
import { PDFDocument } from "pdf-lib";

const MAX_PDF_SIZE = 30 * 1024 * 1024;

async function validatePdf(file: File) {
  if (file.size === 0 || file.size > MAX_PDF_SIZE) {
    throw new Error("ไฟล์ PDF ต้องมีขนาดไม่เกิน 30 MB");
  }
  if (file.type !== "application/pdf") {
    throw new Error("กรุณาอัปโหลดไฟล์ PDF เท่านั้น");
  }
  const bytes = new Uint8Array(await file.slice(0, 5).arrayBuffer());
  const signature = new TextDecoder().decode(bytes);
  if (signature !== "%PDF-") throw new Error("ไฟล์ไม่ใช่ PDF ที่ถูกต้อง");
  try {
    return await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: false });
  } catch {
    throw new Error("ไม่สามารถอ่านไฟล์ PDF นี้ได้");
  }
}

async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") throw new Error("ไม่มีสิทธิ์ผู้ดูแลระบบ");
}

export async function archivePaper(id: string) {
  await requireAdmin();
  await prisma.paper.update({ where: { id }, data: { status: "ARCHIVED" } });
  revalidatePath("/admin");
  revalidatePath("/admin/papers");
  return { ok: true };
}

export async function savePaper(formData: FormData) {
  await requireAdmin();
  const emptyToUndefined = (value: FormDataEntryValue | null) => {
    const text = typeof value === "string" ? value.trim() : "";
    return text || undefined;
  };
  const parseIds = (key: string) => String(formData.get(key) ?? "").split(",").map((item) => item.trim()).filter(Boolean);
  const raw = {
    slug: String(formData.get("slug") ?? ""),
    titleTh: String(formData.get("titleTh") ?? ""),
    titleEn: emptyToUndefined(formData.get("titleEn")),
    abstractTh: String(formData.get("abstractTh") ?? ""),
    abstractEn: emptyToUndefined(formData.get("abstractEn")),
    academicYear: Number(formData.get("academicYear")),
    semester: Number(formData.get("semester")) || undefined,
    pdfUrl: emptyToUndefined(formData.get("pdfUrl")),
    pdfPageCount: Number(formData.get("pdfPageCount")) || undefined,
    pdfSizeBytes: Number(formData.get("pdfSizeBytes")) || undefined,
    coverImageUrl: emptyToUndefined(formData.get("coverImageUrl")),
    accessLevel: String(formData.get("accessLevel") ?? "PUBLIC"),
    status: String(formData.get("status") ?? "DRAFT"),
    researchAreaId: String(formData.get("researchAreaId") ?? ""),
    authorIds: parseIds("authorIds"),
    advisorIds: parseIds("advisorIds"),
    keywordIds: parseIds("keywordIds"),
    technologyIds: parseIds("technologyIds"),
  };
  const parsed = adminPaperSchema.parse(raw);
  const id = emptyToUndefined(formData.get("id"));
  const duplicate = await prisma.paper.findFirst({ where: { slug: parsed.slug, ...(id ? { id: { not: id } } : {}) }, select: { id: true } });
  if (duplicate) throw new Error("Slug นี้ถูกใช้งานแล้ว กรุณาเปลี่ยน Slug");
  const uploadedFile = formData.get("pdfFile");
  let pdfKey = parsed.pdfUrl;
  let pdfPageCount = parsed.pdfPageCount;
  let pdfSizeBytes = parsed.pdfSizeBytes;
  if (uploadedFile instanceof File && uploadedFile.size > 0) {
    const pdf = await validatePdf(uploadedFile);
    const uploaded = await storage.upload(uploadedFile);
    pdfKey = uploaded.key;
    pdfSizeBytes = uploaded.size;
    pdfPageCount = pdf.getPageCount();
    if (id && parsed.pdfUrl) {
      await storage.remove(parsed.pdfUrl).catch(() => undefined);
    }
  }
  const data = {
    slug: parsed.slug, titleTh: parsed.titleTh, titleEn: parsed.titleEn, abstractTh: parsed.abstractTh, abstractEn: parsed.abstractEn,
    academicYear: parsed.academicYear, semester: parsed.semester, pdfUrl: pdfKey, pdfPageCount,
    pdfSizeBytes, coverImageUrl: parsed.coverImageUrl, accessLevel: parsed.accessLevel, status: parsed.status,
    researchAreaId: parsed.researchAreaId,
  };
  if (id) {
    await prisma.$transaction([
      prisma.paper.update({ where: { id }, data }),
      prisma.paperAuthor.deleteMany({ where: { paperId: id } }),
      prisma.paperAdvisor.deleteMany({ where: { paperId: id } }),
      prisma.paperKeyword.deleteMany({ where: { paperId: id } }),
      prisma.paperTech.deleteMany({ where: { paperId: id } }),
      prisma.paperAuthor.createMany({ data: parsed.authorIds.map((authorId, authorOrder) => ({ paperId: id, authorId, authorOrder })) }),
      prisma.paperAdvisor.createMany({ data: parsed.advisorIds.map((advisorId, index) => ({ paperId: id, advisorId, role: index === 0 ? "MAIN" : "CO" })) }),
      prisma.paperKeyword.createMany({ data: parsed.keywordIds.map((keywordId) => ({ paperId: id, keywordId })) }),
      prisma.paperTech.createMany({ data: parsed.technologyIds.map((technologyId) => ({ paperId: id, technologyId })) }),
    ]);
  } else {
    await prisma.paper.create({ data: { ...data, authors: { create: parsed.authorIds.map((authorId, authorOrder) => ({ authorId, authorOrder })) }, advisors: { create: parsed.advisorIds.map((advisorId, index) => ({ advisorId, role: index === 0 ? "MAIN" : "CO" })) }, keywords: { create: parsed.keywordIds.map((keywordId) => ({ keywordId })) }, technologies: { create: parsed.technologyIds.map((technologyId) => ({ technologyId })) } } });
  }

  revalidatePath("/admin");
  revalidatePath("/admin/papers");
  revalidatePath(`/papers/${parsed.slug}`);
  return { ok: true };
}

export async function removePaperPdf(id: string) {
  await requireAdmin();
  const paper = await prisma.paper.findUnique({ where: { id }, select: { pdfUrl: true } });
  if (!paper) throw new Error("ไม่พบภาคนิพนธ์");
  if (paper.pdfUrl) await storage.remove(paper.pdfUrl).catch(() => undefined);
  await prisma.paper.update({ where: { id }, data: { pdfUrl: null, pdfPageCount: null, pdfSizeBytes: null } });
  revalidatePath(`/admin/papers/${id}/edit`);
  revalidatePath("/admin/papers");
  return { ok: true };
}

export async function saveTaxonomy(kind: "area" | "keyword" | "technology", formData: FormData) {
  await requireAdmin();
  const nameTh = String(formData.get("nameTh") ?? "").trim();
  const nameEn = String(formData.get("nameEn") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  if (!nameTh || !slug) throw new Error("กรุณากรอกข้อมูลให้ครบ");
  if (kind === "area") await prisma.researchArea.create({ data: { nameTh, nameEn: nameEn || nameTh, slug } });
  if (kind === "keyword") await prisma.keyword.create({ data: { nameTh, nameEn: nameEn || undefined, slug } });
  if (kind === "technology") await prisma.technology.create({ data: { name: nameTh, slug, category: "OTHER" } });
  revalidatePath(`/admin/${kind === "area" ? "areas" : `${kind}s`}`);
}

export async function updateUserRole(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const role = roleSchema.parse(formData.get("role"));
  await prisma.user.update({ where: { id }, data: { role } });
  revalidatePath("/admin/users");
}

export async function saveAdvisor(formData: FormData) {
  await requireAdmin();
  const titleName = String(formData.get("titleName") ?? "").trim();
  const firstNameTh = String(formData.get("firstNameTh") ?? "").trim();
  const lastNameTh = String(formData.get("lastNameTh") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim() || null;
  if (!titleName || !firstNameTh || !lastNameTh) throw new Error("กรุณากรอกชื่ออาจารย์ให้ครบ");
  await prisma.advisor.create({ data: { titleName, firstNameTh, lastNameTh, email } });
  revalidatePath("/admin/advisors");
}
