import { getAdminAnalytics, type AnalyticsRange } from "@/server/analytics";
import { AnalyticsDashboard } from "./analytics-dashboard";

type AdminPageProps = { searchParams: Promise<{ from?: string; to?: string }> };

function parseRange(params: { from?: string; to?: string }): AnalyticsRange {
  const now = new Date();
  const defaultFrom = new Date(now.getFullYear(), 0, 1);
  const from = params.from ? new Date(`${params.from}T00:00:00`) : defaultFrom;
  const to = params.to ? new Date(`${params.to}T00:00:00`) : new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  return {
    from: Number.isNaN(from.getTime()) ? defaultFrom : from,
    to: Number.isNaN(to.getTime()) ? new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1) : to,
  };
}

function dateValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

export default async function AdminDashboard({ searchParams }: AdminPageProps) {
  const range = parseRange(await searchParams);
  const data = await getAdminAnalytics(range);
  return <div className="space-y-8">
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div><h1 className="text-3xl font-bold">แดชบอร์ดวิเคราะห์</h1><p className="mt-1 text-muted-foreground">ภาพรวมเชิงสถิติของคลังภาคนิพนธ์</p></div>
      <form className="flex flex-wrap items-end gap-2" method="get">
        <label className="text-sm"><span className="mb-1 block text-muted-foreground">ตั้งแต่</span><input name="from" type="date" defaultValue={dateValue(range.from)} className="h-9 rounded-md border bg-background px-2" /></label>
        <label className="text-sm"><span className="mb-1 block text-muted-foreground">ถึง</span><input name="to" type="date" defaultValue={dateValue(new Date(range.to.getTime() - 24 * 60 * 60 * 1000))} className="h-9 rounded-md border bg-background px-2" /></label>
        <button type="submit" className="h-9 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground">ใช้ช่วงเวลา</button>
      </form>
    </div>
    <AnalyticsDashboard data={data} />
  </div>;
}
