"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { removePaperPdf } from "../actions";

type Option = { id: string; name: string };
type Props = {
  action: (formData: FormData) => Promise<{ ok: boolean }>;
  paper?: Record<string, unknown>;
  options: { areas: Option[]; authors: Option[]; advisors: Option[]; keywords: Option[]; technologies: Option[] };
};

export function PaperForm({ action, paper, options }: Props) {
  const [pending, startTransition] = useTransition();
  const value = (key: string) => String(paper?.[key] ?? "");
  const selected = (key: string) => Array.isArray(paper?.[key]) ? (paper?.[key] as string[]).join(",") : "";
  const submit = (data: FormData) => startTransition(async () => {
    try {
      await action(data);
      toast.success("บันทึกข้อมูลเรียบร้อย");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "ไม่สามารถบันทึกข้อมูลได้");
    }
  });
  const removePdf = () => startTransition(async () => {
    try {
      await removePaperPdf(value("id"));
      toast.success("ลบไฟล์ PDF แล้ว");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "ไม่สามารถลบไฟล์ได้");
    }
  });

  return (
    <form action={submit} encType="multipart/form-data" className="space-y-8">
      <input type="hidden" name="id" value={value("id")} />
      <input type="hidden" name="pdfPageCount" value={value("pdfPageCount")} />
      <input type="hidden" name="pdfSizeBytes" value={value("pdfSizeBytes")} />
      <section className="space-y-4 rounded-lg border bg-card p-5">
        <h2 className="text-xl font-semibold">ข้อมูลหลัก</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="ชื่อเรื่องภาษาไทย" name="titleTh" defaultValue={value("titleTh")} required />
          <Field label="ชื่อเรื่องภาษาอังกฤษ" name="titleEn" defaultValue={value("titleEn")} />
          <Field label="Slug" name="slug" defaultValue={value("slug")} required />
          <Field label="ปีการศึกษา (พ.ศ.)" name="academicYear" type="number" defaultValue={value("academicYear")} required />
          <Field label="ภาคเรียน" name="semester" type="number" defaultValue={value("semester")} />
          <label className="space-y-1 text-sm"><span>หมวดงานวิจัย</span><select name="researchAreaId" defaultValue={value("researchAreaId")} className="h-9 w-full rounded-md border bg-background px-3"><option value="">เลือกหมวดงานวิจัย</option>{options.areas.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
        </div>
        <label className="block space-y-1 text-sm"><span>บทคัดย่อภาษาไทย</span><Textarea name="abstractTh" defaultValue={value("abstractTh")} rows={6} required /></label>
        <label className="block space-y-1 text-sm"><span>บทคัดย่อภาษาอังกฤษ</span><Textarea name="abstractEn" defaultValue={value("abstractEn")} rows={5} /></label>
      </section>
      <section className="space-y-4 rounded-lg border bg-card p-5">
        <h2 className="text-xl font-semibold">ผู้จัดทำและที่ปรึกษา</h2>
        <p className="text-sm text-muted-foreground">ใส่รหัสรายการคั่นด้วยเครื่องหมายจุลภาคจากรายการที่มีอยู่</p>
        <Field label="รหัสผู้จัดทำ" name="authorIds" defaultValue={selected("authorIds")} placeholder={options.authors.slice(0, 2).map((item) => item.id).join(",")} />
        <Field label="รหัสอาจารย์ที่ปรึกษา (คนแรกเป็นหลัก)" name="advisorIds" defaultValue={selected("advisorIds")} placeholder={options.advisors.slice(0, 2).map((item) => item.id).join(",")} />
      </section>
      <section className="space-y-4 rounded-lg border bg-card p-5">
        <h2 className="text-xl font-semibold">คำสำคัญและเทคโนโลยี</h2>
        <Field label="รหัสคำสำคัญ" name="keywordIds" defaultValue={selected("keywordIds")} placeholder={options.keywords.slice(0, 2).map((item) => item.id).join(",")} />
        <Field label="รหัสเทคโนโลยี" name="technologyIds" defaultValue={selected("technologyIds")} placeholder={options.technologies.slice(0, 2).map((item) => item.id).join(",")} />
      </section>
      <section className="space-y-4 rounded-lg border bg-card p-5">
        <h2 className="text-xl font-semibold">ไฟล์และสิทธิ์</h2>
        <label className="block space-y-1 text-sm"><span>ไฟล์ PDF (เฉพาะ PDF ไม่เกิน 30 MB)</span><Input name="pdfFile" type="file" accept="application/pdf,.pdf" /></label>
        {paper?.hasPdf === true && <div className="flex items-center gap-3 text-sm text-muted-foreground"><span>มีไฟล์ PDF อยู่แล้ว ({value("pdfPageCount") || "-"} หน้า)</span><Button type="button" variant="destructive" size="sm" onClick={removePdf} disabled={pending}>ลบไฟล์</Button></div>}
        <Field label="URL ภาพปก" name="coverImageUrl" defaultValue={value("coverImageUrl")} />
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1 text-sm"><span>ระดับการเข้าถึง</span><select name="accessLevel" defaultValue={value("accessLevel") || "PUBLIC"} className="h-9 w-full rounded-md border bg-background px-3"><option value="PUBLIC">สาธารณะ</option><option value="AUTHENTICATED">ต้องเข้าสู่ระบบ</option><option value="DEPT_ONLY">เฉพาะภาควิชา</option></select></label>
          <label className="space-y-1 text-sm"><span>สถานะ</span><select name="status" defaultValue={value("status") || "DRAFT"} className="h-9 w-full rounded-md border bg-background px-3"><option value="DRAFT">ฉบับร่าง</option><option value="PUBLISHED">เผยแพร่แล้ว</option><option value="ARCHIVED">เก็บถาวร</option></select></label>
        </div>
      </section>
      <Button type="submit" disabled={pending}>{pending ? "กำลังบันทึก..." : "บันทึกภาคนิพนธ์"}</Button>
    </form>
  );
}

function Field(props: React.ComponentProps<typeof Input> & { label: string }) {
  const { label, ...input } = props;
  return <label className="block space-y-1 text-sm"><span>{label}</span><Input {...input} /></label>;
}
