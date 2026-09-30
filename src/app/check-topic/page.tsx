import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { checkTopicSimilarity } from "@/server/papers";
import { similarityVerdict } from "@/lib/similarity";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };
const first = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] ?? "" : value ?? "";

export default async function CheckTopicPage({ searchParams }: Props) {
  const raw = await searchParams;
  const title = first(raw.title);
  const description = first(raw.description);
  const matches = title ? await checkTopicSimilarity(title, description) : [];
  const verdict = matches[0] ? similarityVerdict(matches[0].match.score) : null;
  return <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
    <div className="max-w-3xl"><p className="mb-2 text-sm font-medium text-primary">เครื่องมือสำหรับนักศึกษา</p><h1 className="text-3xl font-bold tracking-tight sm:text-4xl">ตรวจสอบหัวข้อซ้ำ</h1><p className="mt-3 text-muted-foreground">ลองใส่หัวข้อภาคนิพนธ์เพื่อค้นหางานที่มีเนื้อหาใกล้เคียงในคลังภาคนิพนธ์</p></div>
    <form method="get" className="mt-8 space-y-4 rounded-xl border bg-card p-5">
      <label className="block space-y-2 text-sm font-medium"><span>หัวข้อที่เสนอ</span><Textarea name="title" required defaultValue={title} rows={3} placeholder="เช่น ระบบตรวจวัดคุณภาพอากาศสำหรับห้องเรียนด้วย IoT" /></label>
      <label className="block space-y-2 text-sm font-medium"><span>คำอธิบายสั้น ๆ (ถ้ามี)</span><Textarea name="description" defaultValue={description} rows={3} placeholder="อธิบายปัญหา กลุ่มผู้ใช้ หรือเทคโนโลยีที่สนใจ" /></label>
      <Button type="submit">ตรวจสอบความคล้าย</Button>
    </form>
    {title && verdict && <div className={`mt-8 rounded-xl border p-5 ${verdict.tone === "high" ? "border-red-200 bg-red-50 text-red-900" : verdict.tone === "medium" ? "border-amber-200 bg-amber-50 text-amber-900" : "border-emerald-200 bg-emerald-50 text-emerald-900"}`}><p className="text-sm font-semibold">ผลประเมิน: ระดับ{verdict.label}</p><p className="mt-1 text-lg font-bold">{verdict.message}</p></div>}
    {title && <section className="mt-10 space-y-4"><div><h2 className="text-2xl font-bold">งานที่มีความคล้ายสูงสุด</h2><p className="mt-1 text-sm text-muted-foreground">แสดง 10 รายการแรกจากงานที่เผยแพร่แล้ว</p></div>{matches.length === 0 ? <div className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">ยังไม่พบงานที่ใกล้เคียง ลองปรับคำหรือเพิ่มคำอธิบาย</div> : matches.map(({ paper, match }) => <Card key={paper.id}><CardContent className="p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0"><Link href={`/papers/${paper.slug}`} className="font-semibold hover:text-primary">{paper.titleTh}</Link><p className="mt-1 text-sm text-muted-foreground">{paper.academicYear} · {paper.advisors.map(({ advisor }) => `${advisor.titleName}${advisor.firstNameTh} ${advisor.lastNameTh}`).join(", ") || "ไม่ระบุอาจารย์ที่ปรึกษา"}</p></div><span className="text-xl font-bold">{match.score}%</span></div><div className="mt-3 h-3 overflow-hidden rounded-full bg-muted"><div className={`h-full ${match.score > 70 ? "bg-red-500" : match.score >= 40 ? "bg-amber-500" : "bg-emerald-500"}`} style={{ width: `${match.score}%` }} /></div><div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">{match.matchedTerms.length > 0 && <span className="rounded-full bg-muted px-2 py-1">คำที่ตรงกัน: {match.matchedTerms.slice(0, 6).join(", ")}</span>}{match.matchedTechnologies.length > 0 && <span className="rounded-full bg-muted px-2 py-1">เทคโนโลยีที่ตรงกัน: {match.matchedTechnologies.join(", ")}</span>}{match.matchedTerms.length === 0 && match.matchedTechnologies.length === 0 && <span>ตรงกันจากโครงสร้างชื่อเรื่อง</span>}</div></CardContent></Card>)}</section>}
    <p className="mt-10 text-xs leading-6 text-muted-foreground">หมายเหตุ: ผลลัพธ์นี้เป็นเครื่องมือช่วยค้นคว้าเบื้องต้น ไม่ใช่การวินิจฉัยหรือคำตัดสินอย่างเป็นทางการ หัวข้อที่ได้คะแนนต่ำก็ยังควรปรึกษาอาจารย์ที่ปรึกษา</p>
  </main>;
}
