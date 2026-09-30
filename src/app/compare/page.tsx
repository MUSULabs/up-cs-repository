import { redirect } from "next/navigation";
import { auth } from "@/../auth";
import { prisma } from "@/lib/prisma";

type Props = { searchParams: Promise<{ ids?: string }> };

export default async function ComparePage({ searchParams }: Props) {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/compare");
  const ids = (await searchParams).ids?.split(",").filter(Boolean).slice(0, 3) ?? [];
  const papers = await prisma.paper.findMany({
    where: { id: { in: ids }, status: "PUBLISHED" },
    select: {
      id: true, titleTh: true, academicYear: true, pdfPageCount: true, abstractTh: true,
      researchArea: { select: { nameTh: true } },
      advisors: { select: { advisor: { select: { titleName: true, firstNameTh: true, lastNameTh: true } } } },
      technologies: { select: { technology: { select: { name: true } } } },
    },
  });
  const ordered = ids.flatMap((id) => { const paper = papers.find((item) => item.id === id); return paper ? [paper] : []; });
  const rows: Array<[string, string[]]> = [
    ["ปีการศึกษา", ordered.map((paper) => String(paper.academicYear))],
    ["อาจารย์ที่ปรึกษา", ordered.map((paper) => paper.advisors.map(({ advisor }) => `${advisor.titleName}${advisor.firstNameTh} ${advisor.lastNameTh}`).join(", ") || "-")],
    ["หมวดงานวิจัย", ordered.map((paper) => paper.researchArea.nameTh)],
    ["เทคโนโลยี", ordered.map((paper) => paper.technologies.map(({ technology }) => technology.name).join(", ") || "-")],
    ["จำนวนหน้า", ordered.map((paper) => paper.pdfPageCount ? `${paper.pdfPageCount} หน้า` : "-")],
    ["บทคัดย่อ", ordered.map((paper) => paper.abstractTh)],
  ];
  return <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8"><h1 className="text-3xl font-bold">เปรียบเทียบภาคนิพนธ์</h1>{ordered.length < 2 ? <div className="mt-8 rounded-xl border border-dashed p-10 text-center">กรุณาเลือกอย่างน้อย 2 ภาคนิพนธ์จากหน้าค้นหา</div> : <div className="mt-8 overflow-x-auto rounded-xl border bg-card"><table className="w-full min-w-[48rem] text-sm"><thead><tr className="border-b bg-muted/50"><th className="w-40 p-4 text-left">หัวข้อเปรียบเทียบ</th>{ordered.map((paper) => <th key={paper.id} className="p-4 text-left align-top">{paper.titleTh}</th>)}</tr></thead><tbody>{rows.map(([label, values]) => { const different = new Set(values).size > 1; return <tr key={label} className="border-b align-top last:border-0"><th className="p-4 text-left font-medium">{label}</th>{values.map((value, index) => <td key={`${label}-${ordered[index]?.id}`} className={`p-4 leading-6 ${different ? "bg-amber-50" : ""}`}>{value}</td>)}</tr>; })}</tbody></table></div>}</main>;
}
