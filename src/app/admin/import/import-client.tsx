"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { parseImportFile, validateImport, confirmImport } from "./actions";
import type { ImportMapping, ImportPreview, ImportRow } from "@/server/bulk-import";

const requiredHeaders = ["ชื่อเรื่องภาษาไทย", "ชื่อเรื่องภาษาอังกฤษ", "บทคัดย่อภาษาไทย", "บทคัดย่อภาษาอังกฤษ", "ปีการศึกษา", "ภาคเรียน", "ผู้จัดทำ1", "ผู้จัดทำ2", "ผู้จัดทำ3", "อาจารย์ที่ปรึกษาหลัก", "อาจารย์ที่ปรึกษาร่วม", "หมวดงานวิจัย", "คำสำคัญ", "เทคโนโลยี", "ระดับการเข้าถึง"];

export function ImportClient() {
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [mapping, setMapping] = useState<ImportMapping>({});
  const [preview, setPreview] = useState<ImportPreview[]>([]);
  const [allowCreate, setAllowCreate] = useState(false);
  const [duplicateMode, setDuplicateMode] = useState<"skip" | "overwrite">("skip");
  const [result, setResult] = useState<{ summary: { created: number; skipped: number; failed: number }; errors: Array<{ row: number; title: string; reason: string }> } | null>(null);
  const [pending, startTransition] = useTransition();
  const run = (work: () => Promise<void>) => startTransition(async () => { try { await work(); } catch (error) { toast.error(error instanceof Error ? error.message : "เกิดข้อผิดพลาด"); } });
  const upload = (formData: FormData) => run(async () => {
    const parsed = await parseImportFile(formData);
    setHeaders(parsed.headers);
    setRows(parsed.rows);
    const next = Object.fromEntries(requiredHeaders.map((header) => [header, parsed.headers.includes(header) ? header : ""]));
    setMapping(next);
    setPreview([]);
    setResult(null);
  });
  const validate = () => run(async () => {
    const form = new FormData();
    form.set("rows", JSON.stringify(rows));
    form.set("mapping", JSON.stringify(mapping));
    setPreview(await validateImport(form));
  });
  const confirm = () => run(async () => {
    const form = new FormData();
    form.set("rows", JSON.stringify(rows));
    form.set("mapping", JSON.stringify(mapping));
    form.set("allowCreate", String(allowCreate));
    form.set("duplicateMode", duplicateMode);
    setResult(await confirmImport(form));
    toast.success("นำเข้าข้อมูลเสร็จสิ้น");
  });
  const downloadErrors = () => {
    if (!result?.errors.length) return;
    const csv = ["แถว,ชื่อเรื่อง,เหตุผล", ...result.errors.map((item) => [item.row, item.title, item.reason].map((value) => `"${String(value).replaceAll('"', '""')}"`).join(","))].join("\n");
    const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = "import-errors.csv"; anchor.click(); URL.revokeObjectURL(url);
  };
  return <div className="space-y-6">
    <div><h1 className="text-3xl font-bold">นำเข้าข้อมูลจำนวนมาก</h1><p className="mt-1 text-muted-foreground">รองรับ CSV และ XLSX พร้อมตรวจสอบข้อมูลก่อนบันทึก</p></div>
    <section className="rounded-lg border bg-card p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3"><a className="text-sm text-primary hover:underline" href="/admin/import/template">ดาวน์โหลดไฟล์ต้นแบบ XLSX</a><a className="text-sm text-primary hover:underline" href="/admin/export">ส่งออกข้อมูลทั้งหมดเป็น XLSX</a></div>
      <form action={upload} className="flex flex-wrap items-end gap-3"><label className="space-y-1 text-sm"><span>ไฟล์ข้อมูล</span><Input name="file" type="file" accept=".csv,.xlsx" required /></label><Button type="submit" disabled={pending}>อัปโหลดและอ่านไฟล์</Button></form>
    </section>
    {headers.length > 0 && <section className="rounded-lg border bg-card p-5 space-y-5">
      <div><h2 className="text-xl font-semibold">จับคู่คอลัมน์</h2><p className="text-sm text-muted-foreground">เลือกหัวตารางจริงของไฟล์ให้ตรงกับข้อมูลที่ระบบต้องการ</p></div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{requiredHeaders.map((header) => <label key={header} className="space-y-1 text-sm"><span>{header}</span><select value={mapping[header] ?? ""} onChange={(event) => setMapping({ ...mapping, [header]: event.target.value })} className="h-9 w-full rounded-md border bg-background px-2"><option value="">ไม่ใช้คอลัมน์นี้</option>{headers.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>)}</div>
      <div className="flex flex-wrap gap-4 text-sm"><label className="flex items-center gap-2"><input type="checkbox" checked={allowCreate} onChange={(event) => setAllowCreate(event.target.checked)} />อนุญาตสร้างอาจารย์/หมวด/คำสำคัญ/เทคโนโลยีใหม่</label><label className="flex items-center gap-2">รายการซ้ำ<select value={duplicateMode} onChange={(event) => setDuplicateMode(event.target.value as "skip" | "overwrite")} className="rounded border bg-background px-2 py-1"><option value="skip">ข้าม</option><option value="overwrite">เขียนทับ</option></select></label></div>
      <Button type="button" onClick={validate} disabled={pending}>ตรวจสอบข้อมูล</Button>
    </section>}
    {preview.length > 0 && <section className="rounded-lg border bg-card p-5 space-y-4"><div className="flex items-center justify-between gap-3"><h2 className="text-xl font-semibold">ตัวอย่างผลตรวจสอบ ({preview.length} แถว)</h2><Button type="button" onClick={confirm} disabled={pending || preview.some((item) => item.status === "ERROR")}>ยืนยันนำเข้า</Button></div><div className="overflow-x-auto"><table className="w-full text-sm"><thead className="border-b"><tr><th className="p-2 text-left">แถว</th><th className="p-2 text-left">ชื่อเรื่อง</th><th className="p-2 text-left">สถานะ</th><th className="p-2 text-left">เหตุผล</th></tr></thead><tbody>{preview.map((item) => <tr key={item.row} className="border-b"><td className="p-2">{item.row}</td><td className="p-2">{item.title || "-"}</td><td className="p-2 font-medium">{item.status}</td><td className="p-2 text-muted-foreground">{item.reason}</td></tr>)}</tbody></table></div></section>}
    {result && <section className="rounded-lg border bg-card p-5 space-y-3"><h2 className="text-xl font-semibold">สรุปผลการนำเข้า</h2><p>สร้างสำเร็จ {result.summary.created} รายการ · ข้าม {result.summary.skipped} รายการ · ล้มเหลว {result.summary.failed} รายการ</p>{result.errors.length > 0 && <Button type="button" variant="outline" onClick={downloadErrors}>ดาวน์โหลดรายงานข้อผิดพลาด CSV</Button>}</section>}
  </div>;
}
