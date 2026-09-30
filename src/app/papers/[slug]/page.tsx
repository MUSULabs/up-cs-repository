import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Download, Eye, FileText, LockKeyhole } from "lucide-react";
import { auth } from "@/../auth";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { canDownload } from "@/lib/access";
import { CitationDialog } from "./citation-dialog";
import { PdfPreviewDialog } from "./pdf-preview-dialog";
import { getPaperBySlug, getRelatedPapers, incrementViewCount } from "@/server/papers";

type PaperPageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PaperPageProps): Promise<Metadata> {
  const { slug } = await params;
  const paper = await getPaperBySlug(slug);
  if (!paper) return { title: "ไม่พบภาคนิพนธ์" };
  return {
    title: `${paper.titleTh} | คลังภาคนิพนธ์ ม.พะเยา`,
    description: paper.abstractTh.slice(0, 160),
    openGraph: {
      title: paper.titleTh,
      description: paper.abstractTh.slice(0, 160),
      type: "article",
    },
  };
}

export default async function PaperPage({ params }: PaperPageProps) {
  const { slug } = await params;
  const paper = await getPaperBySlug(slug);
  if (!paper) notFound();

  await incrementViewCount(paper.id);
  const related = await getRelatedPapers(paper.id);
  const session = await auth();
  const allowed = canDownload(paper, session);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <nav className="mb-8 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-primary">หน้าแรก</Link><span className="mx-2">/</span>
        <Link href="/search" className="hover:text-primary">ค้นหาภาคนิพนธ์</Link><span className="mx-2">/</span>
        <span className="text-foreground">รายละเอียด</span>
      </nav>
      <article>
        <div className="max-w-4xl">
          <div className="mb-4 flex flex-wrap gap-2"><Badge>{paper.academicYear}</Badge><Badge variant="outline">{paper.researchArea.nameTh}</Badge></div>
          <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-5xl">{paper.titleTh}</h1>
          {paper.titleEn && <p className="mt-3 text-lg text-muted-foreground">{paper.titleEn}</p>}
        </div>
        <div className="mt-8 grid gap-4 rounded-xl border bg-card p-5 sm:grid-cols-3 lg:grid-cols-6">
          <Meta label="ปีการศึกษา" value={String(paper.academicYear)} />
          <Meta label="ภาคเรียน" value={paper.semester ? `ภาคเรียนที่ ${paper.semester}` : "-"} />
          <Meta label="หมวดงานวิจัย" value={paper.researchArea.nameTh} />
          <Meta label="จำนวนหน้า" value={paper.pdfPageCount ? `${paper.pdfPageCount} หน้า` : "-"} />
          <Meta label="ยอดดู" value={paper.viewCount.toLocaleString("th-TH")} icon={<Eye />} />
          <Meta label="ยอดดาวน์โหลด" value={paper.downloadCount.toLocaleString("th-TH")} icon={<Download />} />
        </div>
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_18rem]">
          <div className="space-y-8">
            <section>
              <h2 className="mb-3 text-xl font-semibold">ผู้เขียน</h2>
              <p className="text-muted-foreground">{paper.authors?.map((item) => `${item.author.firstNameTh} ${item.author.lastNameTh}`).join(" · ") || "-"}</p>
            </section>
            <section>
              <h2 className="mb-3 text-xl font-semibold">อาจารย์ที่ปรึกษา</h2>
              <div className="space-y-2 text-muted-foreground">{paper.advisors.map((item) => <p key={`${item.advisor.id}-${item.role}`}><Badge variant="outline" className="mr-2">{item.role === "MAIN" ? "อาจารย์ที่ปรึกษาหลัก" : "อาจารย์ที่ปรึกษาร่วม"}</Badge>{item.advisor.titleName}{item.advisor.firstNameTh} {item.advisor.lastNameTh}</p>)}</div>
            </section>
            <section>
              <h2 className="mb-3 text-xl font-semibold">บทคัดย่อ</h2>
              <Tabs defaultValue="th">
                <TabsList><TabsTrigger value="th">ภาษาไทย</TabsTrigger><TabsTrigger value="en">English</TabsTrigger></TabsList>
                <TabsContent value="th" className="mt-4 text-base leading-8 text-muted-foreground">{paper.abstractTh}</TabsContent>
                <TabsContent value="en" className="mt-4 text-base leading-8 text-muted-foreground">{paper.abstractEn || "ไม่มีบทคัดย่อภาษาอังกฤษ"}</TabsContent>
              </Tabs>
            </section>
            <TagSection title="คำสำคัญ">{paper.keywords.map(({ keyword }) => <Link key={keyword.id} href={`/search?keyword=${keyword.slug}`}><Badge variant="secondary" className="hover:bg-primary/20">{keyword.nameTh}</Badge></Link>)}</TagSection>
            <TagSection title="เทคโนโลยีที่ใช้">{paper.technologies.map(({ technology }) => <Link key={technology.id} href={`/search?techSlug=${technology.slug}`}><Badge variant="outline" className="hover:border-primary">{technology.name}</Badge></Link>)}</TagSection>
          </div>
          <aside>
            <Card className="sticky top-6">
              <CardContent className="space-y-4 p-5">
                <h2 className="font-semibold">เอกสารฉบับเต็ม</h2>
                <PdfPreviewDialog slug={paper.slug} allowed={allowed} hasPdf={paper.hasPdf} accessLevel={paper.accessLevel} />
                {paper.hasPdf && allowed ? <Button render={<a href={`/api/papers/${paper.slug}/download`} />} className="w-full"><Download className="size-4" />ดาวน์โหลด PDF</Button> : paper.accessLevel === "PUBLIC" ? <Button disabled className="w-full"><FileText className="size-4" />ยังไม่มีไฟล์ดาวน์โหลด</Button> : paper.accessLevel === "AUTHENTICATED" ? <Button render={<Link href="/login" />} className="w-full"><LockKeyhole className="size-4" />เข้าสู่ระบบเพื่อดาวน์โหลด</Button> : <><Button disabled className="w-full"><LockKeyhole className="size-4" />ดาวน์โหลด PDF</Button><p className="text-xs leading-5 text-muted-foreground">เอกสารนี้จำกัดสิทธิ์สำหรับสมาชิกภาควิชาวิทยาการคอมพิวเตอร์ เนื่องจากยังไม่ได้รับอนุญาตให้เผยแพร่</p></>}
                <CitationDialog paper={{ titleTh: paper.titleTh, titleEn: paper.titleEn, academicYear: paper.academicYear, authors: paper.authors?.map(({ author }) => ({ firstNameTh: String(author.firstNameTh), lastNameTh: String(author.lastNameTh) })) ?? [] }} />
                {paper.pdfSizeBytes && <p className="text-xs text-muted-foreground">ขนาดไฟล์ {(paper.pdfSizeBytes / 1024 / 1024).toFixed(1)} MB</p>}
              </CardContent>
            </Card>
          </aside>
        </div>
      </article>
      {related.length > 0 && <section className="mt-16 border-t pt-10"><h2 className="mb-5 text-2xl font-bold">งานวิจัยที่เกี่ยวข้อง</h2><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{related.map((item) => <Link key={item.id} href={`/papers/${item.slug}`}><Card className="h-full transition-shadow hover:shadow-md"><CardContent className="p-4"><Badge variant="secondary">{item.academicYear}</Badge><h3 className="mt-3 line-clamp-3 font-semibold">{item.titleTh}</h3></CardContent></Card></Link>)}</div></section>}
    </main>
  );
}

function Meta({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return <div><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 flex items-center gap-1 text-sm font-medium">{icon && <span className="[&>svg]:size-3.5">{icon}</span>}{value}</p></div>;
}

function TagSection({ title, children }: { title: string; children: React.ReactNode }) {
  return <section><h2 className="mb-3 text-xl font-semibold">{title}</h2><div className="flex flex-wrap gap-2">{children}</div></section>;
}
