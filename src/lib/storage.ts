import { mkdir, stat, unlink, writeFile } from "node:fs/promises";
import { createReadStream } from "node:fs";
import { Readable } from "node:stream";
import path from "node:path";
import crypto from "node:crypto";

export interface StorageDriver {
  upload(file: File): Promise<{ key: string; size: number }>;
  download(key: string): Promise<{ body: ReadableStream<Uint8Array>; size: number }>;
  remove(key: string): Promise<void>;
}

const uploadsDirectory = path.join(process.cwd(), "uploads");

function safeKey(key: string): string {
  const normalized = path.posix.normalize(key).replace(/^(\.\.(\/|\\|$))+/, "");
  if (!normalized || normalized.includes("..") || path.isAbsolute(normalized)) {
    throw new Error("ไฟล์ไม่ถูกต้อง");
  }
  return normalized;
}

class LocalStorage implements StorageDriver {
  async upload(file: File) {
    const key = `${crypto.randomUUID()}.pdf`;
    await mkdir(uploadsDirectory, { recursive: true });
    const bytes = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(uploadsDirectory, key), bytes, { flag: "wx" });
    return { key, size: bytes.length };
  }

  async download(key: string) {
    const filePath = path.join(uploadsDirectory, safeKey(key));
    const metadata = await stat(filePath);
    return {
      body: Readable.toWeb(createReadStream(filePath)) as ReadableStream<Uint8Array>,
      size: metadata.size,
    };
  }

  async remove(key: string) {
    await unlink(path.join(uploadsDirectory, safeKey(key)));
  }
}

export const storage: StorageDriver = new LocalStorage();
