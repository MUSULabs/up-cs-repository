import Link from "next/link";
import { ArrowRight, BookOpen, Database, Download, Search, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getHomeStats, getLatestPapers } from "@/server/papers";
import { getResearchAreas, getTopTechnologies } from "@/server/taxonomy";
import { prisma } from "@/lib/prisma";
import { absoluteUrl } from "@/lib/site";

export async function generateMetadata() {
  const publicPapers = await prisma.paper.findMany({
    where: { status: "PUBLISHED", accessLevel: "PUBLIC" },
    orderBy: { createdAt: "desc" },
    take: 8,
    select: { slug: true, titleTh: true },
  });
  return {
    alternates: { canonical: absoluteUrl("/") },
    openGraph: { url: absoluteUrl("/") },
    other: {
      "application-name": "UP-CS Research Repository",
      "DC.title": "คลังภาคนิพนธ์ วิทยาการคอมพิวเตอร์ มหาวิทยาลัยพะเยา",
    },
    ...(publicPapers.length ? { keywords: publicPapers.map((paper) => paper.titleTh) } : {}),
  };
}

export default async function Home() {
  const [stats, areas, latest, technologies] = await Promise.all([
    getHomeStats(),
    getResearchAreas(),
    getLatestPapers(8),
    getTopTechnologies(15),
  ]);
  const maxTechnologyCount = technologies[0]?._count.papers ?? 1;
  const publicPapers = await prisma.paper.findMany({
    where: { status: "PUBLISHED", accessLevel: "PUBLIC" },
    orderBy: { createdAt: "desc" },
    take: 8,
    select: { slug: true, titleTh: true },
  });
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "คลังภาคนิพนธ์ วิทยาการคอมพิวเตอร์ มหาวิทยาลัยพะเยา",
    description: "คลังภาคนิพนธ์และโครงงานของนิสิตวิทยาการคอมพิวเตอร์ มหาวิทยาลัยพะเยา",
    url: absoluteUrl("/"),
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: publicPapers.length,
      itemListElement: publicPapers.map((paper, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: paper.titleTh,
        url: absoluteUrl(`/papers/${paper.slug}`),
      })),
    },
  };

  return (
    <main className="flex-1">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <section className="border-b bg-gradient-to-b from-primary/10 via-background to-background">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="max-w-3xl">
            <Badge variant="secondary" className="mb-5">UP-CS Research Repository</Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
              คลังภาคนิพนธ์<br /><span className="text-primary">วิทยาการคอมพิวเตอร์ ม.พะเยา</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
              ค้นพบผลงานภาคนิพนธ์ที่ผ่านมา เพื่อหาแรงบันดาลใจ หัวข้อวิจัย อาจารย์ที่ปรึกษา และเทคโนโลยีที่เหมาะกับโครงงานของคุณ
            </p>
            <form action="/search" className="mt-8 flex max-w-2xl gap-2">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
                <Input name="q" placeholder="ค้นหาชื่อเรื่อง คำสำคัญ หรือเทคโนโลยี..." className="h-12 bg-background pl-11" />
              </div>
              <Button type="submit" size="lg">ค้นหา</Button>
            </form>
            <div className="mt-4 flex flex-wrap gap-4 text-sm font-medium">
              <Link href="/check-topic" className="text-primary hover:underline">มีหัวข้ออยู่แล้ว? ตรวจสอบหัวข้อซ้ำก่อนเริ่มทำ</Link>
              <Link href="/stats" className="text-primary hover:underline">ดูภาพรวมภาคนิพนธ์ของสาขา</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b bg-card">
        <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-y sm:grid-cols-4 sm:divide-y-0 px-4 sm:px-6 lg:px-8">
          <Stat icon={<BookOpen />} value={stats.totalPapers} label="ภาคนิพนธ์" />
          <Stat icon={<Users />} value={stats.authors} label="ผู้เขียน" />
          <Stat icon={<Database />} value={stats.advisors} label="อาจารย์ที่ปรึกษา" />
          <Stat icon={<Download />} value={stats.downloads} label="ยอดดาวน์โหลด" />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeading title="หมวดงานวิจัย" href="/search" />
        {areas.length === 0 ? <EmptySection text="ยังไม่มีหมวดงานวิจัย" /> : <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {areas.map((area) => (
            <Link key={area.id} href={`/search?areaSlug=${area.slug}`} className="group">
              <Card className="h-full transition-all group-hover:-translate-y-1 group-hover:border-primary group-hover:shadow-md">
                <CardContent className="p-5">
                  <h3 className="font-semibold group-hover:text-primary">{area.nameTh}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{area._count.papers} ภาคนิพนธ์</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>}
      </section>

      <section className="border-y bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <SectionHeading title="ภาคนิพนธ์ล่าสุด" href="/search" />
          {latest.length === 0 ? <EmptySection text="ยังไม่มีภาคนิพนธ์เผยแพร่" /> : <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {latest.map((paper) => (
              <Link key={paper.id} href={`/papers/${paper.slug}`} className="group">
                <Card className="h-full transition-all group-hover:-translate-y-1 group-hover:shadow-md">
                  <CardContent className="p-5">
                    <Badge variant="secondary">{paper.academicYear}</Badge>
                    <h3 className="mt-4 line-clamp-3 font-semibold leading-6 group-hover:text-primary">{paper.titleTh}</h3>
                    <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{paper.abstractTh}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeading title="เทคโนโลยียอดนิยม" href="/search" />
        {technologies.length === 0 ? <EmptySection text="ยังไม่มีข้อมูลเทคโนโลยี" /> : <div className="flex flex-wrap items-center gap-3">
          {technologies.map((technology) => (
            <Link key={technology.id} href={`/search?techSlug=${technology.slug}`} className="rounded-full border bg-card px-4 py-2 transition-colors hover:border-primary hover:bg-primary/5" style={{ fontSize: `${0.8 + (technology._count.papers / maxTechnologyCount) * 0.45}rem` }}>
              {technology.name} <span className="text-xs text-muted-foreground">({technology._count.papers})</span>
            </Link>
          ))}
        </div>}
      </section>
      <footer className="border-t bg-muted/30">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-8 text-sm text-muted-foreground sm:px-6 lg:px-8">
          <p className="font-medium text-foreground">สาขาวิชาวิทยาการคอมพิวเตอร์ คณะเทคโนโลยีสารสนเทศและการสื่อสาร มหาวิทยาลัยพะเยา</p>
          <p>คลังนี้จัดทำขึ้นเพื่อการศึกษาและการค้นคว้า ข้อมูลและสิทธิ์การเผยแพร่เป็นไปตามที่เจ้าของผลงานอนุญาต</p>
        </div>
      </footer>
    </main>
  );
}

function Stat({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return <div className="flex items-center gap-3 px-4 py-5 sm:px-6"><span className="text-primary [&>svg]:size-5">{icon}</span><div><p className="text-2xl font-bold">{value.toLocaleString("th-TH")}</p><p className="text-xs text-muted-foreground">{label}</p></div></div>;
}

function SectionHeading({ title, href }: { title: string; href: string }) {
  return <div className="mb-6 flex items-center justify-between"><h2 className="text-2xl font-bold">{title}</h2><Link href={href} className="flex items-center gap-1 text-sm text-primary hover:underline">ดูทั้งหมด <ArrowRight className="size-4" /></Link></div>;
}

function EmptySection({ text }: { text: string }) {
  return <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">{text}</div>;
}
