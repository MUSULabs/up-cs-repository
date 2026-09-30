import "dotenv/config";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { PrismaClient } from "../src/generated/prisma/client";
import { storage } from "../src/lib/storage";

const prisma = new PrismaClient();

async function main() {
  if (process.env.STORAGE_DRIVER !== "blob") {
    throw new Error("ตั้ง STORAGE_DRIVER=blob ก่อนย้ายไฟล์ไป Vercel Blob");
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error("ต้องตั้ง BLOB_READ_WRITE_TOKEN ก่อนย้ายไฟล์");
  }

  const uploadsDirectory = path.join(process.cwd(), "uploads");
  const files = await readdir(uploadsDirectory, { withFileTypes: true }).catch(() => []);
  let migrated = 0;

  for (const entry of files) {
    if (!entry.isFile() || !entry.name.toLowerCase().endsWith(".pdf")) continue;
    const key = entry.name;
    const paper = await prisma.paper.findFirst({ where: { pdfUrl: key }, select: { id: true } });
    if (!paper) continue;
    const uploaded = await storage.upload(await readFile(path.join(uploadsDirectory, key)), key);
    await prisma.paper.update({ where: { id: paper.id }, data: { pdfUrl: uploaded.key, pdfSizeBytes: uploaded.size } });
    migrated += 1;
    console.log(`ย้าย ${key} -> ${uploaded.key}`);
  }

  console.log(`ย้ายไฟล์สำเร็จ ${migrated} รายการ`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
