import { BarChart3 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { getPublicStats } from "@/server/analytics";

export default async function StatsPage() {
  const data = await getPublicStats();
  const max = Math.max(...data.papersByYear.map((item) => item.count), 1);
  return <main className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
    <div className="mb-10"><p className="flex items-center gap-2 text-sm font-medium text-primary"><BarChart3 className="size-4" />ข้อมูลสาธารณะ</p><h1 className="mt-2 text-4xl font-bold">ภาพรวมภาคนิพนธ์ของสาขา</h1><p className="mt-3 text-muted-foreground">สถิติภาพรวมเพื่อช่วยให้นิสิตเห็นแนวโน้มของหัวข้อและเทคโนโลยีที่เคยมีการศึกษา</p></div>
    <div className="grid gap-6 lg:grid-cols-2">
      <Card><CardContent className="p-6"><h2 className="font-semibold">ภาคนิพนธ์ตามปีการศึกษา</h2><div className="mt-8 flex h-56 items-end gap-4">{data.papersByYear.map((item) => <div key={item.year} className="flex flex-1 flex-col items-center gap-2"><div className="w-full rounded-t bg-primary" style={{ height: `${Math.max(item.count / max * 100, 8)}%` }} title={`${item.count} รายการ`} /><span className="text-xs text-muted-foreground">{item.year}</span><span className="text-xs font-medium">{item.count}</span></div>)}</div></CardContent></Card>
      <Card><CardContent className="p-6"><h2 className="font-semibold">หมวดงานวิจัย</h2><div className="mt-5 space-y-3">{data.areas.map((item) => <div key={item.name} className="flex items-center justify-between border-b pb-2 text-sm last:border-0"><span>{item.name}</span><span className="font-semibold text-primary">{item.count}</span></div>)}</div></CardContent></Card>
    </div>
    <Card className="mt-6"><CardContent className="p-6"><h2 className="font-semibold">เทคโนโลยียอดนิยม</h2><div className="mt-5 flex flex-wrap gap-3">{data.technologies.map((item) => <span key={item.name} className="rounded-full border bg-muted/30 px-4 py-2 text-sm">{item.name} <span className="text-muted-foreground">({item.count})</span></span>)}</div></CardContent></Card>
  </main>;
}
