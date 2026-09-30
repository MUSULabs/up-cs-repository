import * as XLSX from "xlsx";
import { auth } from "@/../auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return Response.json({ message: "ไม่มีสิทธิ์ผู้ดูแลระบบ" }, { status: 403 });
  const papers = await prisma.paper.findMany({
    orderBy: { academicYear: "desc" },
    select: {
      titleTh: true, titleEn: true, abstractTh: true, abstractEn: true, academicYear: true, semester: true, accessLevel: true, status: true,
      researchArea: { select: { nameTh: true } },
      authors: { orderBy: { authorOrder: "asc" }, select: { author: { select: { firstNameTh: true, lastNameTh: true } } } },
      advisors: { select: { role: true, advisor: { select: { titleName: true, firstNameTh: true, lastNameTh: true } } } },
      keywords: { select: { keyword: { select: { nameTh: true } } } },
      technologies: { select: { technology: { select: { name: true } } } },
    },
  });
  const rows = papers.map((paper) => ({
    ชื่อเรื่องภาษาไทย: paper.titleTh,
    ชื่อเรื่องภาษาอังกฤษ: paper.titleEn ?? "",
    บทคัดย่อภาษาไทย: paper.abstractTh,
    บทคัดย่อภาษาอังกฤษ: paper.abstractEn ?? "",
    ปีการศึกษา: paper.academicYear,
    ภาคเรียน: paper.semester ?? "",
    ผู้จัดทำ1: paper.authors[0] ? `${paper.authors[0].author.firstNameTh} ${paper.authors[0].author.lastNameTh}` : "",
    ผู้จัดทำ2: paper.authors[1] ? `${paper.authors[1].author.firstNameTh} ${paper.authors[1].author.lastNameTh}` : "",
    ผู้จัดทำ3: paper.authors[2] ? `${paper.authors[2].author.firstNameTh} ${paper.authors[2].author.lastNameTh}` : "",
    อาจารย์ที่ปรึกษาหลัก: paper.advisors.find((item) => item.role === "MAIN") ? `${paper.advisors.find((item) => item.role === "MAIN")?.advisor.titleName}${paper.advisors.find((item) => item.role === "MAIN")?.advisor.firstNameTh} ${paper.advisors.find((item) => item.role === "MAIN")?.advisor.lastNameTh}` : "",
    อาจารย์ที่ปรึกษาร่วม: paper.advisors.find((item) => item.role === "CO") ? `${paper.advisors.find((item) => item.role === "CO")?.advisor.titleName}${paper.advisors.find((item) => item.role === "CO")?.advisor.firstNameTh} ${paper.advisors.find((item) => item.role === "CO")?.advisor.lastNameTh}` : "",
    หมวดงานวิจัย: paper.researchArea.nameTh,
    คำสำคัญ: paper.keywords.map((item) => item.keyword.nameTh).join(", "),
    เทคโนโลยี: paper.technologies.map((item) => item.technology.name).join(", "),
    ระดับการเข้าถึง: paper.accessLevel,
    สถานะ: paper.status,
  }));
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "ภาคนิพนธ์");
  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
  return new Response(buffer, { headers: { "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "Content-Disposition": 'attachment; filename="up-cs-papers.xlsx"' } });
}
