import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/../auth";
import { canDownload } from "@/lib/access";
import { prisma } from "@/lib/prisma";
import { storage } from "@/lib/storage";

const requests = new Map<string, number[]>();
const WINDOW_MS = 60 * 60 * 1000;
const MAX_DOWNLOADS = 20;

function json(message: string, status: number) {
  return NextResponse.json({ message }, { status });
}

function clientIp(request: NextRequest) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || request.headers.get("x-real-ip")
    || "unknown";
}

function hashIp(ip: string) {
  const salt = process.env.DOWNLOAD_IP_SALT || process.env.AUTH_SECRET;
  if (!salt) throw new Error("DOWNLOAD_IP_SALT หรือ AUTH_SECRET ยังไม่ได้ตั้งค่า");
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex");
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const paper = await prisma.paper.findUnique({
    where: { slug },
    select: { id: true, titleTh: true, pdfUrl: true, accessLevel: true, status: true },
  });
  if (!paper || paper.status !== "PUBLISHED") return json("ไม่พบเอกสาร", 404);
  const session = await auth();
  if (!canDownload(paper, session)) {
    return paper.accessLevel === "AUTHENTICATED"
      ? json("กรุณาเข้าสู่ระบบเพื่อดาวน์โหลดเอกสาร", 401)
      : json("เอกสารนี้จำกัดสิทธิ์สำหรับสมาชิกภาควิชา", 403);
  }
  if (!paper.pdfUrl) return json("ยังไม่มีไฟล์ PDF", 404);

  const ipHash = hashIp(clientIp(request));
  const now = Date.now();
  const recent = (requests.get(ipHash) || []).filter((time) => now - time < WINDOW_MS);
  if (recent.length >= MAX_DOWNLOADS) return json("ดาวน์โหลดเกิน 20 ครั้งต่อชั่วโมง กรุณาลองใหม่ภายหลัง", 429);
  recent.push(now);
  requests.set(ipHash, recent);

  let file: { body: ReadableStream<Uint8Array>; size: number };
  try {
    file = await storage.download(paper.pdfUrl);
  } catch {
    return json("ไม่พบไฟล์ PDF", 404);
  }

  await prisma.$transaction([
    prisma.paper.update({ where: { id: paper.id }, data: { downloadCount: { increment: 1 } } }),
    prisma.downloadLog.create({
      data: {
        paperId: paper.id,
        userId: session?.user?.id || null,
        ipHash,
        userAgent: request.headers.get("user-agent"),
      },
    }),
  ]);

  return new NextResponse(file.body, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Length": String(file.size),
      "Content-Disposition": `attachment; filename="paper-${paper.id}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
