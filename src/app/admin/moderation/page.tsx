import { redirect } from "next/navigation";
import { auth } from "@/../auth";
import { getModerationQueue } from "@/server/submissions";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default async function ModerationPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/login?callbackUrl=/admin/moderation");
  const queue = await getModerationQueue();
  return <main><div><h1 className="text-3xl font-bold">คิวตรวจสอบภาคนิพนธ์</h1><p className="mt-1 text-muted-foreground">รายการที่นิสิตส่งเข้ามารอการตรวจสอบ</p></div><div className="mt-8 space-y-3">{queue.length === 0 ? <div className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">ไม่มีรายการรอตรวจสอบ</div> : queue.map((paper) => <Link key={paper.id} href={`/admin/moderation/${paper.id}`} className="block rounded-lg border bg-card p-5 hover:border-primary"><div className="flex items-start justify-between gap-3"><div><h2 className="font-semibold">{paper.titleTh}</h2><p className="mt-1 text-sm text-muted-foreground">{paper.researchArea.nameTh} · {paper.submittedAt?.toLocaleDateString("th-TH")}</p></div><Badge>รอตรวจสอบ</Badge></div></Link>)}</div></main>;
}
