import * as XLSX from "xlsx";
import slugify from "slugify";
import { prisma } from "@/lib/prisma";
import type { AccessLevel } from "@/generated/prisma/client";

export const IMPORT_HEADERS = [
  "ชื่อเรื่องภาษาไทย", "ชื่อเรื่องภาษาอังกฤษ", "บทคัดย่อภาษาไทย", "บทคัดย่อภาษาอังกฤษ",
  "ปีการศึกษา", "ภาคเรียน", "ผู้จัดทำ1", "ผู้จัดทำ2", "ผู้จัดทำ3",
  "อาจารย์ที่ปรึกษาหลัก", "อาจารย์ที่ปรึกษาร่วม", "หมวดงานวิจัย", "คำสำคัญ", "เทคโนโลยี", "ระดับการเข้าถึง",
] as const;

export type ImportMapping = Record<string, string>;
export type ImportRow = Record<string, string>;
export type ImportPreview = { row: number; status: "VALID" | "WARNING" | "ERROR"; reason: string; title: string; duplicateId?: string };

const clean = (value: unknown) => String(value ?? "").trim();
const normalize = (value: string) => value.toLocaleLowerCase("th-TH").replace(/\s+/g, "").replace(/[^\p{L}\p{N}]/gu, "");
const parts = (value: string) => value.split(/[,،\n|]/u).map((item) => item.trim()).filter(Boolean);
const similarity = (left: string, right: string) => {
  const a = normalize(left);
  const b = normalize(right);
  if (!a || !b) return 0;
  if (a === b) return 1;
  if (a.includes(b) || b.includes(a)) return 0.9;
  const grams = (text: string) => new Set([...text].map((_, index) => text.slice(index, index + 2)));
  const ag = grams(a);
  const bg = grams(b);
  const intersection = [...ag].filter((gram) => bg.has(gram)).length;
  return (2 * intersection) / Math.max(1, ag.size + bg.size);
};

export function parseWorkbook(buffer: ArrayBuffer) {
  const workbook = XLSX.read(buffer, { type: "array", cellDates: false });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  if (!sheet) throw new Error("ไม่พบแผ่นงานในไฟล์");
  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: "" });
  const headers = (rows.shift() ?? []).map(clean);
  if (!headers.length) throw new Error("ไม่พบหัวตาราง");
  return { headers, rows: rows.filter((row) => row.some((value) => clean(value))).map((row) => Object.fromEntries(headers.map((header, index) => [header, clean(row[index])]))) };
}

function value(row: ImportRow, mapping: ImportMapping, header: string) {
  return clean(row[mapping[header] ?? header]);
}

async function matchName(items: Array<{ id: string; name: string }>, name: string) {
  const score = items.map((item) => ({ ...item, score: similarity(item.name, name) })).sort((a, b) => b.score - a.score)[0];
  return score && score.score >= 0.72 ? score : null;
}

export async function validateImportRows(rows: ImportRow[], mapping: ImportMapping) {
  const [areas, advisors, keywords, technologies, papers] = await Promise.all([
    prisma.researchArea.findMany({ select: { id: true, nameTh: true } }),
    prisma.advisor.findMany({ select: { id: true, titleName: true, firstNameTh: true, lastNameTh: true } }),
    prisma.keyword.findMany({ select: { id: true, nameTh: true } }),
    prisma.technology.findMany({ select: { id: true, name: true } }),
    prisma.paper.findMany({ select: { id: true, titleTh: true, titleEn: true } }),
  ]);
  const areaOptions = areas.map((item) => ({ id: item.id, name: item.nameTh }));
  const advisorOptions = advisors.map((item) => ({ id: item.id, name: `${item.titleName}${item.firstNameTh} ${item.lastNameTh}` }));
  const keywordOptions = keywords.map((item) => ({ id: item.id, name: item.nameTh }));
  const technologyOptions = technologies.map((item) => ({ id: item.id, name: item.name }));
  return rows.map((row, index): ImportPreview => {
    const title = value(row, mapping, "ชื่อเรื่องภาษาไทย");
    const abstract = value(row, mapping, "บทคัดย่อภาษาไทย");
    const year = Number(value(row, mapping, "ปีการศึกษา"));
    const area = value(row, mapping, "หมวดงานวิจัย");
    const access = value(row, mapping, "ระดับการเข้าถึง") || "PUBLIC";
    const reasons: string[] = [];
    let status: ImportPreview["status"] = "VALID";
    if (!title || !abstract || !year || !area) {
      status = "ERROR";
      reasons.push("ขาดชื่อเรื่อง บทคัดย่อ ปีการศึกษา หรือหมวดงานวิจัย");
    }
    if (year < 2500 || year > 2700) { status = "ERROR"; reasons.push("ปีการศึกษาไม่ถูกต้อง"); }
    if (!["PUBLIC", "AUTHENTICATED", "DEPT_ONLY"].includes(access)) { status = "ERROR"; reasons.push("ระดับการเข้าถึงไม่ถูกต้อง"); }
    if (!matchName(areaOptions, area)) { status = "WARNING"; reasons.push("ไม่พบหมวดงานวิจัยที่ตรงกัน"); }
    const advisorNames = [value(row, mapping, "อาจารย์ที่ปรึกษาหลัก"), value(row, mapping, "อาจารย์ที่ปรึกษาร่วม")].filter(Boolean);
    if (advisorNames.some((name) => !matchName(advisorOptions, name))) { status = status === "ERROR" ? status : "WARNING"; reasons.push("มีอาจารย์ที่ปรึกษาที่ไม่พบในระบบ"); }
    if (parts(value(row, mapping, "คำสำคัญ")).some((name) => !matchName(keywordOptions, name))) { status = status === "ERROR" ? status : "WARNING"; reasons.push("มีคำสำคัญใหม่"); }
    if (parts(value(row, mapping, "เทคโนโลยี")).some((name) => !matchName(technologyOptions, name))) { status = status === "ERROR" ? status : "WARNING"; reasons.push("มีเทคโนโลยีใหม่"); }
    const duplicate = papers.map((paper) => ({ paper, score: Math.max(similarity(title, paper.titleTh), similarity(title, paper.titleEn ?? "")) })).sort((a, b) => b.score - a.score)[0];
    if (duplicate && duplicate.score >= 0.86) { status = status === "ERROR" ? status : "WARNING"; reasons.push("พบชื่อเรื่องใกล้เคียงกับข้อมูลเดิม"); return { row: index + 2, status, reason: reasons.join(" / "), title, duplicateId: duplicate.paper.id }; }
    return { row: index + 2, status, reason: reasons.join(" / ") || "ข้อมูลครบถ้วน", title };
  });
}

export function makeSlug(title: string, year: number) {
  return `${slugify(title, { lower: true, strict: true, locale: "th" }).slice(0, 70) || "paper"}-${year}-${Math.random().toString(36).slice(2, 7)}`;
}

export async function importRows(rows: ImportRow[], mapping: ImportMapping, allowCreate: boolean, duplicateMode: "skip" | "overwrite") {
  const previews = await validateImportRows(rows, mapping);
  const summary = { created: 0, skipped: 0, failed: 0 };
  const errors: Array<{ row: number; title: string; reason: string }> = [];
  for (const [index, row] of rows.entries()) {
    const preview = previews[index];
    if (preview.status === "ERROR" || (preview.duplicateId && duplicateMode === "skip")) {
      summary[preview.status === "ERROR" ? "failed" : "skipped"]++;
      errors.push({ row: preview.row, title: preview.title, reason: preview.status === "ERROR" ? preview.reason : "ข้ามรายการซ้ำตามที่เลือก" });
      continue;
    }
    try {
      const titleTh = value(row, mapping, "ชื่อเรื่องภาษาไทย");
      const titleEn = value(row, mapping, "ชื่อเรื่องภาษาอังกฤษ") || null;
      const abstractTh = value(row, mapping, "บทคัดย่อภาษาไทย");
      const year = Number(value(row, mapping, "ปีการศึกษา"));
      const areaName = value(row, mapping, "หมวดงานวิจัย");
      const accessLevel = value(row, mapping, "ระดับการเข้าถึง") as AccessLevel || "PUBLIC";
      await prisma.$transaction(async (tx) => {
        const area = await tx.researchArea.findMany({ select: { id: true, nameTh: true } });
        const matchedArea = await matchName(area.map((item) => ({ id: item.id, name: item.nameTh })), areaName);
        let researchAreaId = matchedArea?.id;
        if (!researchAreaId) {
          if (!allowCreate) throw new Error("ไม่อนุญาตสร้างหมวดงานวิจัยใหม่");
          researchAreaId = (await tx.researchArea.create({ data: { nameTh: areaName, nameEn: areaName, slug: makeSlug(areaName, year) } })).id;
        }
        const findOrCreateAdvisor = async (name: string) => {
          const found = await tx.advisor.findMany({ select: { id: true, titleName: true, firstNameTh: true, lastNameTh: true } });
          const matched = await matchName(found.map((item) => ({ id: item.id, name: `${item.titleName}${item.firstNameTh} ${item.lastNameTh}` })), name);
          if (matched) return matched.id;
          if (!allowCreate) throw new Error(`ไม่อนุญาตสร้างอาจารย์ใหม่: ${name}`);
          const pieces = name.replace(/^(ผศ\.ดร\.|รศ\.ดร\.|ดร\.|อาจารย์)\s*/u, "").split(/\s+/u);
          return (await tx.advisor.create({ data: { titleName: name.match(/^(ผศ\.ดร\.|รศ\.ดร\.|ดร\.|อาจารย์)/u)?.[0] ?? "อาจารย์", firstNameTh: pieces[0] ?? name, lastNameTh: pieces.slice(1).join(" ") || "-" } })).id;
        };
        const advisorIds = [value(row, mapping, "อาจารย์ที่ปรึกษาหลัก"), value(row, mapping, "อาจารย์ที่ปรึกษาร่วม")].filter(Boolean);
        const advisors = await Promise.all(advisorIds.map(findOrCreateAdvisor));
        const createTaxonomy = async (name: string, kind: "keyword" | "technology") => {
          const list = kind === "keyword"
            ? await tx.keyword.findMany({ select: { id: true, nameTh: true } })
            : await tx.technology.findMany({ select: { id: true, name: true } });
          const matched = await matchName(list.map((item) => ({ id: item.id, name: "nameTh" in item ? item.nameTh : item.name })), name);
          if (matched) return matched.id;
          if (!allowCreate) throw new Error(`ไม่อนุญาตสร้างรายการใหม่: ${name}`);
          if (kind === "keyword") return (await tx.keyword.create({ data: { nameTh: name, slug: makeSlug(name, year) } })).id;
          return (await tx.technology.create({ data: { name, slug: makeSlug(name, year), category: "OTHER" } })).id;
        };
        const keywordIds = await Promise.all(parts(value(row, mapping, "คำสำคัญ")).map((name) => createTaxonomy(name, "keyword")));
        const technologyIds = await Promise.all(parts(value(row, mapping, "เทคโนโลยี")).map((name) => createTaxonomy(name, "technology")));
        const authors = await Promise.all(["ผู้จัดทำ1", "ผู้จัดทำ2", "ผู้จัดทำ3"].map((header) => value(row, mapping, header)).filter(Boolean).map(async (name) => {
          const pieces = name.split(/\s+/u);
          const found = await tx.author.findFirst({ where: { firstNameTh: pieces[0], lastNameTh: pieces.slice(1).join(" ") } });
          if (found) return found.id;
          if (!allowCreate) throw new Error(`ไม่อนุญาตสร้างผู้จัดทำใหม่: ${name}`);
          return (await tx.author.create({ data: { firstNameTh: pieces[0] ?? name, lastNameTh: pieces.slice(1).join(" ") || "-" } })).id;
        }));
        const data = { titleTh, titleEn, abstractTh, abstractEn: value(row, mapping, "บทคัดย่อภาษาอังกฤษ") || null, academicYear: year, semester: Number(value(row, mapping, "ภาคเรียน")) || null, accessLevel, status: "PUBLISHED" as const, researchAreaId };
        const existing = preview.duplicateId && duplicateMode === "overwrite" ? preview.duplicateId : undefined;
        if (existing) {
          await tx.paper.update({ where: { id: existing }, data });
          await Promise.all([tx.paperAuthor.deleteMany({ where: { paperId: existing } }), tx.paperAdvisor.deleteMany({ where: { paperId: existing } }), tx.paperKeyword.deleteMany({ where: { paperId: existing } }), tx.paperTech.deleteMany({ where: { paperId: existing } })]);
          await tx.paperAuthor.createMany({ data: authors.map((authorId, authorOrder) => ({ paperId: existing, authorId, authorOrder })) });
          await tx.paperAdvisor.createMany({ data: advisors.map((advisorId, index) => ({ paperId: existing, advisorId, role: index === 0 ? "MAIN" : "CO" })) });
          await tx.paperKeyword.createMany({ data: keywordIds.map((keywordId) => ({ paperId: existing, keywordId })) });
          await tx.paperTech.createMany({ data: technologyIds.map((technologyId) => ({ paperId: existing, technologyId })) });
        } else {
          await tx.paper.create({ data: { ...data, slug: makeSlug(titleTh, year), authors: { create: authors.map((authorId, authorOrder) => ({ authorId, authorOrder })) }, advisors: { create: advisors.map((advisorId, index) => ({ advisorId, role: index === 0 ? "MAIN" : "CO" })) }, keywords: { create: keywordIds.map((keywordId) => ({ keywordId })) }, technologies: { create: technologyIds.map((technologyId) => ({ technologyId })) } } });
        }
      });
      summary.created++;
    } catch (error) {
      summary.failed++;
      errors.push({ row: preview.row, title: preview.title, reason: error instanceof Error ? error.message : "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ" });
    }
  }
  return { summary, errors };
}
