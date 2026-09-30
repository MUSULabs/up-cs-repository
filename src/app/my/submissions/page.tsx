import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/../auth";
import { getUserSubmissions } from "@/server/submissions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const labels = { DRAFT: "ฉบับร่าง", PENDING: "รอตรวจสอบ", REJECTED: "ถูกปฏิเสธ", PUBLISHED: "เผยแพร่แล้ว", ARCHIVED: "เก็บถาวร" } as const;
export default async function MySubmissionsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/my/submissions");
  const submissions = await getUserSubmissions(session.user.id);
  return <main className="mx-auto max-w-5xl px-4 py-10"><div className="flex items-center justify-between"><div><h1 className="text-3xl font-bold">ภาคนิพนธ์ของฉัน</h1><p className="mt-1 text-muted-foreground">ติดตามสถานะการส่งภาคนิพนธ์</p></div><Button render={<Link href="/submit" />}>ส่งภาคนิพนธ์ใหม่</Button></div><div className="mt-8 space-y-4">{submissions.length === 0 ? <div className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">ยังไม่มีรายการส่ง</div> : submissions.map((paper) => <div key={paper.id} className="rounded-lg border bg-card p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><Link href={paper.status === "PUBLISHED" ? `/papers/${paper.slug}` : "#"} className="font-semibold">{paper.titleTh}</Link><p className="mt-1 text-sm text-muted-foreground">{paper.researchArea.nameTh} · {paper.submittedAt?.toLocaleDateString("th-TH") ?? "-"}</p></div><Badge variant={paper.status === "REJECTED" ? "destructive" : "secondary"}>{labels[paper.status]}</Badge></div>{paper.status === "REJECTED" && <><p className="mt-3 rounded bg-red-50 p-3 text-sm text-red-900">เหตุผล: {paper.rejectionReason || "ไม่ระบุ"}</p><Button render={<Link href={`/submit?id=${paper.id}`} />} variant="outline" size="sm" className="mt-3">แก้ไขและส่งใหม่</Button></>}</div>)}</div></main>;
}
