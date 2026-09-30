import { del, get, put } from "@vercel/blob";
import { mkdir, stat, unlink, writeFile } from "node:fs/promises";
import { createReadStream } from "node:fs";
import { Readable } from "node:stream";
import path from "node:path";
import crypto from "node:crypto";

export type StorageInput = File | Buffer;

export interface StorageDriver {
  upload(file: StorageInput, filename?: string): Promise<{ key: string; size: number }>;
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

async function inputBytes(input: StorageInput): Promise<Buffer> {
  if (Buffer.isBuffer(input)) return input;
  return Buffer.from(await input.arrayBuffer());
}

class LocalStorage implements StorageDriver {
  async upload(file: StorageInput) {
    const key = `${crypto.randomUUID()}.pdf`;
    await mkdir(uploadsDirectory, { recursive: true });
    const bytes = await inputBytes(file);
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

class BlobStorage implements StorageDriver {
  private readonly token = process.env.BLOB_READ_WRITE_TOKEN;

  private requireToken() {
    if (!this.token) throw new Error("BLOB_READ_WRITE_TOKEN ยังไม่ได้ตั้งค่า");
    return this.token;
  }

  async upload(file: StorageInput, filename = "paper.pdf") {
    const bytes = await inputBytes(file);
    const pathname = `papers/${crypto.randomUUID()}-${path.basename(filename, ".pdf")}.pdf`;
    const blob = await put(pathname, bytes, {
      access: "private",
      contentType: "application/pdf",
      token: this.requireToken(),
    });
    return { key: blob.pathname, size: bytes.length };
  }

  async download(key: string) {
    const result = await get(key, { access: "private", token: this.requireToken() });
    if (!result || result.statusCode !== 200 || !result.stream) throw new Error("ไม่พบไฟล์ PDF");
    return { body: result.stream, size: result.blob.size };
  }

  async remove(key: string) {
    await del(key, { token: this.requireToken() });
  }
}

const driverName = process.env.STORAGE_DRIVER || (process.env.NODE_ENV === "production" ? "blob" : "local");
export const storage: StorageDriver = driverName === "blob" ? new BlobStorage() : new LocalStorage();
