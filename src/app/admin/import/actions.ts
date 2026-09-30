"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/../auth";
import { importRows, parseWorkbook, validateImportRows, type ImportMapping, type ImportRow } from "@/server/bulk-import";

async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") throw new Error("ไม่มีสิทธิ์ผู้ดูแลระบบ");
}

export async function parseImportFile(formData: FormData) {
  await requireAdmin();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) throw new Error("กรุณาเลือกไฟล์ CSV หรือ XLSX");
  if (!/\.(csv|xlsx)$/iu.test(file.name)) throw new Error("รองรับเฉพาะไฟล์ .csv และ .xlsx");
  if (file.size > 10 * 1024 * 1024) throw new Error("ไฟล์ต้องมีขนาดไม่เกิน 10 MB");
  return parseWorkbook(await file.arrayBuffer());
}

export async function validateImport(formData: FormData) {
  await requireAdmin();
  const rows = JSON.parse(String(formData.get("rows") ?? "[]")) as ImportRow[];
  const mapping = JSON.parse(String(formData.get("mapping") ?? "{}")) as ImportMapping;
  return validateImportRows(rows, mapping);
}

export async function confirmImport(formData: FormData) {
  await requireAdmin();
  const rows = JSON.parse(String(formData.get("rows") ?? "[]")) as ImportRow[];
  const mapping = JSON.parse(String(formData.get("mapping") ?? "{}")) as ImportMapping;
  const allowCreate = formData.get("allowCreate") === "true";
  const duplicateMode = formData.get("duplicateMode") === "overwrite" ? "overwrite" : "skip";
  const result = await importRows(rows, mapping, allowCreate, duplicateMode);
  revalidatePath("/admin");
  revalidatePath("/admin/papers");
  revalidatePath("/");
  return result;
}
