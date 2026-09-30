import Link from "next/link";
import { LockKeyhole, Search as SearchIcon, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MobileFilters } from "./mobile-filters";
import { SortSelect } from "./sort-select";
import { searchPapers } from "@/server/papers";
import { searchParamsSchema, type SearchParams } from "@/lib/validations";
import { auth } from "@/../auth";
import { getBookmarkedPaperIds } from "@/server/personalization";
import { BookmarkButton } from "@/components/bookmark-button";
import { CompareBar, CompareSelector } from "@/components/compare-selector";
import { SaveSearchButton } from "@/components/save-search-button";

type SearchPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const accessLabels = {
  PUBLIC: "สาธารณะ",
  AUTHENTICATED: "ต้องเข้าสู่ระบบ",
  DEPT_ONLY: "เฉพาะบุคลากร/นักศึกษา",
} as const;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function toSearchParams(raw: Record<string, string | string[] | undefined>): SearchParams {
  return searchParamsSchema.parse({
    q: first(raw.q),
    year: first(raw.year),
    areaSlug: first(raw.areaSlug),
    advisorId: first(raw.advisorId),
    techSlug: first(raw.techSlug),
    keyword: first(raw.keyword),
    accessLevel: first(raw.accessLevel),
    advisorQ: first(raw.advisorQ),
    sort: first(raw.sort) ?? (first(raw.q) ? "relevance" : "newest"),
    page: first(raw.page) ?? "1",
  });
}

function hrefWith(
  params: SearchParams,
  changes: Partial<Record<keyof SearchParams, string | number | undefined>>,
  options: { clearPage?: boolean } = {},
) {
  const next = new URLSearchParams();
  const merged = { ...params, ...changes };
  for (const [key, value] of Object.entries(merged)) {
    if (value === undefined || value === "" || (options.clearPage && key === "page")) continue;
    next.set(key, String(value));
  }
  return `/search?${next.toString()}`;
}

function FilterLink({
  href,
  checked,
  children,
}: {
  href: string;
  checked: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className="group flex items-center gap-2 rounded-md px-1 py-1.5 text-sm hover:bg-muted">
      <input type="checkbox" checked={checked} readOnly className="size-4 accent-primary" />
      <span className="min-w-0 flex-1">{children}</span>
    </Link>
  );
}

function HighlightedText({ text, query }: { text: string; query?: string }) {
  if (!query) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return text.split(new RegExp(`(${escaped})`, "ig")).map((part, index) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark key={index} className="rounded bg-amber-200 px-0.5 text-foreground">{part}</mark>
    ) : (
      part
    ),
  );
}

function Facets({ params, result }: { params: SearchParams; result: Awaited<ReturnType<typeof searchPapers>> }) {
  const clear = hrefWith(params, { q: undefined, year: undefined, areaSlug: undefined, advisorId: undefined, techSlug: undefined, accessLevel: undefined, advisorQ: undefined, page: 1 });
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">ตัวกรอง</h2>
        <Link href={clear} className="text-xs text-primary hover:underline">ล้างทั้งหมด</Link>
      </div>
      <FacetSection title="ปีการศึกษา">
        {result.facetCounts.years.map((facet) => (
          <FilterLink key={facet.year} checked={params.year === facet.year} href={hrefWith(params, { year: params.year === facet.year ? undefined : facet.year, page: 1 })}>
            <span>{facet.year}</span><span className="text-muted-foreground">({facet.count})</span>
          </FilterLink>
        ))}
      </FacetSection>
      <FacetSection title="หมวดงานวิจัย">
        {result.facetCounts.areas.map((facet) => (
          <FilterLink key={facet.slug} checked={params.areaSlug === facet.slug} href={hrefWith(params, { areaSlug: params.areaSlug === facet.slug ? undefined : facet.slug, page: 1 })}>
            <span className="truncate">{facet.nameTh}</span><span className="text-muted-foreground">({facet.count})</span>
          </FilterLink>
        ))}
      </FacetSection>
      <FacetSection title="อาจารย์ที่ปรึกษา">
        <form action="/search" className="mb-2">
          {(["q", "year", "areaSlug", "advisorId", "techSlug", "keyword", "accessLevel", "sort"] as const).map((key) => params[key] && <input key={key} type="hidden" name={key} value={params[key]} />)}
          <Input name="advisorQ" defaultValue={params.advisorQ} placeholder="ค้นหาชื่ออาจารย์" className="h-8 text-xs" />
        </form>
        {result.facetCounts.advisors.map((facet) => (
          <FilterLink key={facet.id} checked={params.advisorId === facet.id} href={hrefWith(params, { advisorId: params.advisorId === facet.id ? undefined : facet.id, page: 1 })}>
            <span className="truncate">{facet.name}</span><span className="text-muted-foreground">({facet.count})</span>
          </FilterLink>
        ))}
      </FacetSection>
      <FacetSection title="เทคโนโลยีที่ใช้">
        {result.facetCounts.technologies.map((facet) => (
          <FilterLink key={facet.slug} checked={params.techSlug === facet.slug} href={hrefWith(params, { techSlug: params.techSlug === facet.slug ? undefined : facet.slug, page: 1 })}>
            <span className="truncate">{facet.name}</span><span className="text-muted-foreground">({facet.count})</span>
          </FilterLink>
        ))}
      </FacetSection>
      <FacetSection title="ระดับการเข้าถึง">
        {result.facetCounts.accessLevels.map((facet) => (
          <FilterLink key={facet.level} checked={params.accessLevel === facet.level} href={hrefWith(params, { accessLevel: params.accessLevel === facet.level ? undefined : facet.level, page: 1 })}>
            <span>{accessLabels[facet.level]}</span><span className="text-muted-foreground">({facet.count})</span>
          </FilterLink>
        ))}
      </FacetSection>
    </div>
  );
}

function FacetSection({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="space-y-2 border-t pt-4 first:border-t-0 first:pt-0"><h3 className="text-sm font-medium">{title}</h3><div className="space-y-0.5">{children}</div></section>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = toSearchParams(await searchParams);
  const result = await searchPapers(params);
  const session = await auth();
  const bookmarkedIds = session?.user?.id ? await getBookmarkedPaperIds(session.user.id, result.items.map((item) => item.id)) : [];
  const selectedIds = (first((await searchParams).compare) ?? "").split(",").filter(Boolean).slice(0, 3);
  const hasFilters = Boolean(params.q || params.year || params.areaSlug || params.advisorId || params.techSlug || params.accessLevel);
  const chips = [
    params.q && ["คำค้น", params.q, { q: undefined }],
    params.year && ["ปี", String(params.year), { year: undefined }],
    params.areaSlug && ["หมวดงานวิจัย", result.facetCounts.areas.find((item) => item.slug === params.areaSlug)?.nameTh ?? params.areaSlug, { areaSlug: undefined }],
    params.advisorId && ["อาจารย์", result.facetCounts.advisors.find((item) => item.id === params.advisorId)?.name ?? params.advisorId, { advisorId: undefined }],
    params.techSlug && ["เทคโนโลยี", result.facetCounts.technologies.find((item) => item.slug === params.techSlug)?.name ?? params.techSlug, { techSlug: undefined }],
    params.accessLevel && ["การเข้าถึง", accessLabels[params.accessLevel], { accessLevel: undefined }],
  ].filter(Boolean) as Array<[string, string, Partial<SearchParams>]>;

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="mb-2 text-sm font-medium text-primary">คลังภาคนิพนธ์ วิทยาการคอมพิวเตอร์</p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">ค้นหาภาคนิพนธ์</h1>
        <p className="mt-2 text-muted-foreground">ค้นพบผลงานที่ผ่านมาเพื่อเป็นแรงบันดาลใจในการทำโครงงานของคุณ</p>
      </div>
      <form action="/search" className="mb-5 flex gap-2">
        <div className="relative flex-1">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input name="q" defaultValue={params.q} placeholder="ค้นหาชื่อเรื่อง บทคัดย่อ หรือคำสำคัญ..." className="h-11 pl-9" aria-label="ค้นหาภาคนิพนธ์" />
          {(["year", "areaSlug", "advisorId", "techSlug", "accessLevel", "sort"] as const).map((key) => params[key] && <input key={key} type="hidden" name={key} value={params[key]} />)}
        </div>
        <Button type="submit" className="h-11">ค้นหา</Button>
      </form>
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <MobileFilters><Facets params={params} result={result} /></MobileFilters>
        <p className="text-sm text-muted-foreground">พบ <span className="font-semibold text-foreground">{result.total}</span> ผลลัพธ์</p>
        <div className="ml-auto flex items-center gap-2">
          {session?.user && <SaveSearchButton queryString={new URLSearchParams(Object.entries(params).map(([key, value]) => [key, String(value)])).toString()} />}
          <span className="hidden text-sm text-muted-foreground sm:inline">เรียงตาม</span>
          <SortSelect value={params.sort} hasQuery={Boolean(params.q)} />
        </div>
      </div>
      {chips.length > 0 && (
        <div className="mb-6 flex flex-wrap items-center gap-2">
          {chips.map(([label, value, change]) => <Link key={label} href={hrefWith(params, { ...change, page: 1 })} className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs text-primary hover:bg-primary/20">{label}: {value}<X className="size-3" /></Link>)}
          {hasFilters && <Link href={hrefWith(params, { q: undefined, year: undefined, areaSlug: undefined, advisorId: undefined, techSlug: undefined, accessLevel: undefined, advisorQ: undefined, page: 1 })} className="text-xs text-muted-foreground underline-offset-4 hover:underline">ล้างตัวกรองทั้งหมด</Link>}
        </div>
      )}
      <div className="grid gap-8 md:grid-cols-[16rem_1fr]">
        <aside className="hidden rounded-xl border bg-card p-4 md:block"><Facets params={params} result={result} /></aside>
        <section className="min-w-0">
          {result.items.length === 0 ? <EmptyState /> : <div className="space-y-4">{result.items.map((paper) => <PaperCard key={paper.id} paper={paper} query={params.q} bookmarked={bookmarkedIds.includes(paper.id)} selected={selectedIds.includes(paper.id)} authenticated={Boolean(session?.user)} />)}</div>}
          <CompareBar ids={selectedIds} />
          <Pagination params={params} totalPages={result.totalPages} />
        </section>
      </div>
    </main>
  );
}

function PaperCard({ paper, query, bookmarked, selected, authenticated }: { paper: Awaited<ReturnType<typeof searchPapers>>["items"][number]; query?: string; bookmarked: boolean; selected: boolean; authenticated: boolean }) {
  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="p-5 sm:p-6">
        <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
          <div className="flex items-center gap-3"><CompareSelector paperId={paper.id} selected={selected} />{authenticated ? <BookmarkButton paperId={paper.id} initialBookmarked={bookmarked} compact /> : null}</div>
          <div className="flex flex-wrap gap-2"><Badge variant="secondary">{paper.academicYear}</Badge><Badge variant="outline">{paper.researchArea.nameTh}</Badge></div>
          {paper.accessLevel !== "PUBLIC" && <span title="เอกสารนี้มีข้อจำกัดในการดาวน์โหลด" className="inline-flex items-center gap-1 text-xs text-muted-foreground"><LockKeyhole className="size-4" />จำกัดการเข้าถึง</span>}
        </div>
        <Link href={`/papers/${paper.slug}`} className="group">
          <h2 className="text-lg font-semibold leading-snug group-hover:text-primary">{paper.titleTh}</h2>
          {paper.titleEn && <p className="mt-1 text-sm text-muted-foreground">{paper.titleEn}</p>}
        </Link>
        <p className="mt-3 text-sm text-muted-foreground">{paper.authors?.map((item) => `${item.author.firstNameTh} ${item.author.lastNameTh}`).join(" · ")}</p>
        <p className="mt-1 text-xs text-muted-foreground">อาจารย์ที่ปรึกษา: {paper.advisors.map((item) => `${item.advisor.titleName}${item.advisor.firstNameTh} ${item.advisor.lastNameTh}`).join(", ")}</p>
        <p className="mt-4 line-clamp-2 text-sm leading-6 text-muted-foreground"><HighlightedText text={paper.abstractTh} query={query} /></p>
        <div className="mt-4 flex flex-wrap gap-1.5">{paper.technologies.map(({ technology }) => <Badge key={technology.id} variant="outline" className="font-normal">{technology.name}</Badge>)}</div>
      </CardContent>
    </Card>
  );
}

function Pagination({ params, totalPages }: { params: SearchParams; totalPages: number }) {
  if (totalPages <= 1) return null;
  return <nav className="mt-8 flex items-center justify-center gap-2" aria-label="เปลี่ยนหน้าผลลัพธ์">
    {params.page > 1 && <Button render={<Link href={hrefWith(params, { page: params.page - 1 })} />} variant="outline">ก่อนหน้า</Button>}
    <span className="text-sm text-muted-foreground">หน้า {params.page} / {totalPages}</span>
    {params.page < totalPages && <Button render={<Link href={hrefWith(params, { page: params.page + 1 })} />} variant="outline">ถัดไป</Button>}
  </nav>;
}

function EmptyState() {
  return <div className="rounded-xl border border-dashed p-10 text-center"><h2 className="text-xl font-semibold">ไม่พบภาคนิพนธ์ที่ตรงกับการค้นหา</h2><p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">ลองใช้คำค้นที่กว้างขึ้น หรือล้างตัวกรองบางรายการ เช่น ปีการศึกษา หมวดงานวิจัย หรือเทคโนโลยี</p><Button render={<Link href="/search" />} variant="outline" className="mt-5">ดูภาคนิพนธ์ทั้งหมด</Button></div>;
}
