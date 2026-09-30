"use client";

import Link from "next/link";
import { Download } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMemo, useState } from "react";

type Analytics = Awaited<ReturnType<typeof import("@/server/analytics").getAdminAnalytics>>;
const colors = ["#2563eb", "#7c3aed", "#059669", "#ea580c", "#db2777", "#0891b2", "#65a30d", "#ca8a04"];

function exportCsv(name: string, rows: Record<string, unknown>[]) {
  if (!rows.length) return;
  const keys = Object.keys(rows[0]);
  const csv = ["\uFEFF" + keys.join(","), ...rows.map((row) => keys.map((key) => `"${String(row[key] ?? "").replaceAll('"', '""')}"`).join(","))].join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const anchor = document.createElement("a"); anchor.href = url; anchor.download = `${name}.csv`; anchor.click(); URL.revokeObjectURL(url);
}

function ExportButton({ name, rows }: { name: string; rows: Record<string, unknown>[] }) {
  return <Button type="button" variant="outline" size="sm" onClick={() => exportCsv(name, rows)}><Download className="size-3.5" />CSV</Button>;
}

export function AnalyticsDashboard({ data }: { data: Analytics }) {
  const techRows = data.technologies.flatMap((technology) => data.technologyYears.map((year) => ({ เทคโนโลยี: technology.name, ปี: year, จำนวน: technology.years[String(year)] ?? 0 })));
  const advisorRows = data.advisors.map((row) => ({ อาจารย์: row.advisor, ปี: row.year, จำนวน: row.count }));
  const [advisorSort, setAdvisorSort] = useState<"advisor" | "year" | "count">("count");
  const sortedAdvisors = useMemo(() => [...data.advisors].sort((a, b) => advisorSort === "count" ? b.count - a.count : advisorSort === "year" ? b.year - a.year : a.advisor.localeCompare(b.advisor, "th")), [advisorSort, data.advisors]);
  return <div className="space-y-8">
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {[
        ["ภาคนิพนธ์เผยแพร่", data.kpis.totalPapers.toLocaleString("th-TH")],
        ["ภาคนิพนธ์ปีนี้", data.kpis.thisYearPapers.toLocaleString("th-TH")],
        ["ดาวน์โหลดทั้งหมด", data.kpis.totalDownloads.toLocaleString("th-TH")],
        ["ผู้เข้าชมไม่ซ้ำ", data.kpis.uniqueVisitors.toLocaleString("th-TH")],
      ].map(([label, value]) => <Card key={label}><CardContent className="p-5"><p className="text-sm text-muted-foreground">{label}</p><p className="mt-2 text-3xl font-bold">{value}</p></CardContent></Card>)}
    </div>
    <div className="grid gap-6 lg:grid-cols-2">
      <ChartCard title="ภาคนิพนธ์ตามปีการศึกษา" exportRows={data.papersByYear.map((row) => ({ ปี: row.year, จำนวน: row.count }))} exportName="papers-by-year">
        <ResponsiveContainer width="100%" height={280}><BarChart data={data.papersByYear}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="year" /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey="count" name="ภาคนิพนธ์" fill="#2563eb" /></BarChart></ResponsiveContainer>
      </ChartCard>
      <ChartCard title="สัดส่วนตามหมวดงานวิจัย" exportRows={data.areas.map((row) => ({ หมวด: row.name, จำนวน: row.count }))} exportName="papers-by-area">
        <ResponsiveContainer width="100%" height={280}><PieChart><Pie data={data.areas} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>{data.areas.map((entry, index) => <Cell key={entry.name} fill={colors[index % colors.length]} />)}</Pie><Tooltip /><Legend /></PieChart></ResponsiveContainer>
      </ChartCard>
    </div>
    <ChartCard title="เทคโนโลยียอดนิยมย้อนหลัง 3 ปี" exportRows={techRows} exportName="trending-technologies">
      <ResponsiveContainer width="100%" height={340}><BarChart data={data.technologies.map((item) => ({ name: item.name, ...Object.fromEntries(data.technologyYears.map((year) => [String(year), item.years[String(year)] ?? 0])) }))} layout="vertical"><CartesianGrid strokeDasharray="3 3" /><XAxis type="number" allowDecimals={false} /><YAxis dataKey="name" type="category" width={120} /><Tooltip /><Legend />{data.technologyYears.map((year, index) => <Bar key={year} dataKey={String(year)} name={String(year)} fill={colors[index]} />)}</BarChart></ResponsiveContainer>
    </ChartCard>
    <div className="grid gap-6 lg:grid-cols-2">
      <ChartCard title="ดาวน์โหลด 30 วันล่าสุด" exportRows={data.downloadsOverTime.map((row) => ({ วันที่: row.date, จำนวน: row.count }))} exportName="downloads-30-days">
        <ResponsiveContainer width="100%" height={280}><LineChart data={data.downloadsOverTime}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" /><YAxis allowDecimals={false} /><Tooltip /><Line type="monotone" dataKey="count" name="ดาวน์โหลด" stroke="#7c3aed" strokeWidth={2} /></LineChart></ResponsiveContainer>
      </ChartCard>
      <ChartCard title="ภาระงานอาจารย์ที่ปรึกษา" exportRows={advisorRows} exportName="advisor-workload">
        <div className="mb-3 flex gap-2"><Button type="button" size="sm" variant={advisorSort === "count" ? "default" : "outline"} onClick={() => setAdvisorSort("count")}>จำนวน</Button><Button type="button" size="sm" variant={advisorSort === "year" ? "default" : "outline"} onClick={() => setAdvisorSort("year")}>ปี</Button><Button type="button" size="sm" variant={advisorSort === "advisor" ? "default" : "outline"} onClick={() => setAdvisorSort("advisor")}>ชื่อ</Button></div><div className="max-h-72 overflow-auto"><table className="w-full text-sm"><thead><tr className="border-b text-left"><th className="p-2">อาจารย์</th><th className="p-2">ปี</th><th className="p-2 text-right">จำนวน</th></tr></thead><tbody>{sortedAdvisors.map((row) => <tr key={`${row.advisor}-${row.year}`} className="border-b last:border-0"><td className="p-2">{row.advisor}</td><td className="p-2">{row.year}</td><td className="p-2 text-right">{row.count}</td></tr>)}</tbody></table></div>
      </ChartCard>
    </div>
    <div className="grid gap-6 lg:grid-cols-2">
      <PopularCard title="ดาวน์โหลดสูงสุด 10 อันดับ" data={data.mostDownloaded} exportName="most-downloaded" />
      <PopularCard title="ยอดดูสูงสุด 10 อันดับ" data={data.mostViewed} exportName="most-viewed" />
    </div>
  </div>;
}

function PopularCard({ title, data, exportName }: { title: string; data: Analytics["mostDownloaded"]; exportName: string }) {
  return <ChartCard title={title} exportRows={data.map((row) => ({ ชื่อเรื่อง: row.title, ดาวน์โหลด: row.downloads, ยอดดู: row.views }))} exportName={exportName}><div className="space-y-3">{data.length ? data.map((row, index) => <Link href={`/papers/${row.slug}`} key={row.id} className="flex items-center justify-between gap-4 border-b pb-2 last:border-0"><span className="line-clamp-1"><Badge variant="secondary" className="mr-2">{index + 1}</Badge>{row.title}</span><span className="shrink-0 text-xs text-muted-foreground">ดาวน์โหลด {row.downloads} · ดู {row.views}</span></Link>) : <p className="text-sm text-muted-foreground">ยังไม่มีข้อมูล</p>}</div></ChartCard>;
}

function ChartCard({ title, exportRows, exportName, children }: { title: string; exportRows: Record<string, unknown>[]; exportName: string; children: React.ReactNode }) {
  return <Card><CardHeader className="flex flex-row items-center justify-between gap-4"><CardTitle className="text-lg">{title}</CardTitle><ExportButton name={exportName} rows={exportRows} /></CardHeader><CardContent>{children}</CardContent></Card>;
}
