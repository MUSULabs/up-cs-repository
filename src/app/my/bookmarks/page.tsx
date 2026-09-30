import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/../auth";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getUserBookmarks, exportBookmarksBibtex } from "@/server/personalization";
import { saveBookmarkNote } from "@/app/my/actions";

export default async function BookmarksPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/my/bookmarks");
  const bookmarks = await getUserBookmarks(session.user.id);
  const grouped = new Map<string, typeof bookmarks>();
  for (const bookmark of bookmarks) grouped.set(bookmark.paper.researchArea.nameTh, [...(grouped.get(bookmark.paper.researchArea.nameTh) ?? []), bookmark]);
  const bib = exportBookmarksBibtex(bookmarks);
  return <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8"><div className="flex flex-wrap items-end justify-between gap-3"><div><h1 className="text-3xl font-bold">ภาคนิพนธ์ที่บันทึกไว้</h1><p className="mt-1 text-muted-foreground">{bookmarks.length} รายการ</p></div><div className="flex gap-2"><a href={`data:text/plain;charset=utf-8,${encodeURIComponent(bib)}`} download="bookmarks.bib"><Button variant="outline">ดาวน์โหลด .bib</Button></a><Link href="/my/searches"><Button variant="outline">การค้นหาที่บันทึกไว้</Button></Link></div></div>
    {bookmarks.length === 0 ? <div className="mt-8 rounded-xl border border-dashed p-10 text-center text-muted-foreground">ยังไม่มีภาคนิพนธ์ที่บันทึกไว้ ลองกดปุ่มรูป bookmark ในหน้าค้นหา</div> : <div className="mt-8 space-y-10">{[...grouped.entries()].map(([area, items]) => <section key={area}><h2 className="mb-4 text-xl font-semibold">{area}</h2><div className="grid gap-4 sm:grid-cols-2">{items.map(({ paper, note }) => <Card key={paper.id}><CardContent className="space-y-3 p-5"><Link href={`/papers/${paper.slug}`} className="font-semibold hover:text-primary">{paper.titleTh}</Link><p className="text-sm text-muted-foreground">{paper.academicYear} · {paper.authors.map(({ author }) => `${author.firstNameTh} ${author.lastNameTh}`).join(" · ")}</p><form action={saveBookmarkNote} className="flex gap-2"><input type="hidden" name="paperId" value={paper.id} /><Input name="note" defaultValue={note ?? ""} placeholder="บันทึกส่วนตัว..." /><Button type="submit" size="sm">บันทึก</Button></form></CardContent></Card>)}</div></section>)}</div>}
  </main>;
}
