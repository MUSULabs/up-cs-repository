import "dotenv/config";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { PrismaClient } from "../src/generated/prisma/client";
import { storage } from "../src/lib/storage";

const prisma = new PrismaClient();

async function main() {
  const papers = await prisma.paper.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { createdAt: "asc" },
    take: 10,
    select: { id: true, titleTh: true, titleEn: true, pdfUrl: true },
  });
  for (const paper of papers) {
    if (paper.pdfUrl) continue;
    const document = await PDFDocument.create();
    const font = await document.embedFont(StandardFonts.Helvetica);
    const titleFont = await document.embedFont(StandardFonts.HelveticaBold);
    for (let pageNumber = 1; pageNumber <= 4; pageNumber += 1) {
      const page = document.addPage([595, 842]);
      page.drawText(pageNumber === 1 ? "UP-CS Research Repository" : "Demo PDF Page", {
        x: 64, y: 730, size: pageNumber === 1 ? 24 : 18, font: titleFont, color: rgb(0.1, 0.2, 0.5),
      });
      page.drawText(pageNumber === 1 ? (paper.titleEn || paper.titleTh.replace(/[^\x00-\x7F]/g, " ")) : `Demo page ${pageNumber} for download testing`, {
        x: 64, y: 670, size: 16, font, maxWidth: 460, lineHeight: 24,
      });
      page.drawText(`Page ${pageNumber} / 4`, { x: 64, y: 80, size: 11, font, color: rgb(0.4, 0.4, 0.4) });
    }
    const bytes = Buffer.from(await document.save());
    const uploaded = await storage.upload(bytes, `${paper.id}.pdf`);
    await prisma.paper.update({
      where: { id: paper.id },
      data: { pdfUrl: uploaded.key, pdfPageCount: 4, pdfSizeBytes: uploaded.size },
    });
    console.log(`แนบ PDF ให้ ${paper.titleTh}`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
