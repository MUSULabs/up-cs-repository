import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/../auth";
import { Button } from "@/components/ui/button";
import { deleteSavedSearch } from "@/app/my/actions";
import { getSavedSearches } from "@/server/personalization";

export default async function SavedSearchesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/my/searches");
  const searches = await getSavedSearches(session.user.id);
  return <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8"><h1 className="text-3xl font-bold">การค้นหาที่บันทึกไว้</h1><p className="mt-1 text-muted-foreground">กลับมาใช้ชุดตัวกรองเดิมได้ในคลิกเดียว</p><div className="mt-8 space-y-3">{searches.length === 0 ? <div className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">ยังไม่มีการค้นหาที่บันทึกไว้</div> : searches.map((item) => <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-card p-4"><div><Link href={`/search?${item.queryString}`} className="font-medium hover:text-primary">{item.name}</Link><p className="mt-1 text-xs text-muted-foreground">{item.queryString}</p></div><form action={deleteSavedSearch.bind(null, item.id)}><Button type="submit" variant="outline" size="sm">ลบ</Button></form></div>)}</div></main>;
}
