import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { getAdminDashboard } from "@/server/admin";

export default async function AdminDashboard() {
  const data = await getAdminDashboard();
  const max = Math.max(...data.byYear.map((item) => item.count), 1);
  return <div className="space-y-8">
    <div><h1 className="text-3xl font-bold">แดชบอร์ด</h1><p className="mt-1 text-muted-foreground">ภาพรวมคลังภาคนิพนธ์</p></div>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[["เผยแพร่แล้ว", data.counts.published], ["ฉบับร่าง", data.counts.draft], ["เก็บถาวร", data.counts.archived], ["ผู้ใช้งาน", data.counts.users]].map(([label, value]) => <Card key={String(label)}><CardContent className="p-5"><p className="text-sm text-muted-foreground">{String(label)}</p><p className="mt-2 text-3xl font-bold">{value}</p></CardContent></Card>)}</div>
    <Card><CardContent className="p-5"><h2 className="font-semibold">ภาคนิพนธ์ตามปีการศึกษา</h2>{data.byYear.length === 0 ? <p className="mt-6 text-sm text-muted-foreground">ยังไม่มีข้อมูล</p> : <div className="mt-6 flex h-52 items-end gap-4">{data.byYear.map((item) => <div key={item.year} className="flex flex-1 flex-col items-center gap-2"><div className="w-full rounded-t bg-primary" style={{ height: `${Math.max((item.count / max) * 100, 8)}%` }} title={`${item.count} รายการ`} /><span className="text-xs text-muted-foreground">{item.year}</span></div>)}</div>}</CardContent></Card>
    <div className="grid gap-6 lg:grid-cols-2">
      <Card><CardContent className="p-5"><h2 className="mb-4 font-semibold">ภาคนิพนธ์ล่าสุด</h2>{data.recent.length === 0 ? <p className="text-sm text-muted-foreground">ยังไม่มีภาคนิพนธ์</p> : <div className="space-y-3">{data.recent.map((item) => <Link key={item.id} href={`/admin/papers/${item.id}/edit`} className="block border-b pb-3 last:border-0"><p className="font-medium hover:text-primary">{item.titleTh}</p><p className="text-xs text-muted-foreground">{item.academicYear} · {item.status}</p></Link>)}</div>}</CardContent></Card>
      <Card><CardContent className="p-5"><h2 className="mb-4 font-semibold">ดาวน์โหลดสูงสุด 10 อันดับ</h2>{data.downloaded.length === 0 ? <p className="text-sm text-muted-foreground">ยังไม่มีข้อมูลการดาวน์โหลด</p> : <div className="space-y-3">{data.downloaded.map((item, index) => <Link key={item.id} href={`/papers/${item.slug}`} className="flex justify-between gap-3 border-b pb-3 last:border-0"><span className="line-clamp-1"><span className="mr-2 text-muted-foreground">{index + 1}.</span>{item.titleTh}</span><span className="shrink-0 text-sm text-muted-foreground">{item.downloadCount}</span></Link>)}</div>}</CardContent></Card>
    </div>
  </div>;
}
