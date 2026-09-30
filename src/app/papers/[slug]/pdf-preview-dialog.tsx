"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { Eye, LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const PdfPreviewFrame = dynamic(
  () => import("./pdf-preview-frame").then((module) => module.PdfPreviewFrame),
  { ssr: false, loading: () => <div className="flex h-[70vh] items-center justify-center text-muted-foreground">กำลังโหลดตัวอย่าง...</div> },
);

export function PdfPreviewDialog({
  slug,
  allowed,
  hasPdf,
  accessLevel,
}: {
  slug: string;
  allowed: boolean;
  hasPdf: boolean;
  accessLevel: string;
}) {
  const [open, setOpen] = useState(false);
  const canPreview = hasPdf && allowed;
  return (
    <>
      <Button type="button" variant="outline" className="w-full" disabled={!hasPdf} onClick={() => setOpen(true)}>
        {canPreview ? <Eye className="size-4" /> : <LockKeyhole className="size-4" />}
        ดูตัวอย่าง
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>ตัวอย่างเอกสาร PDF</DialogTitle>
            <DialogDescription>
              {canPreview ? "เอกสารตัวอย่างจะแสดงผ่านช่องทางดาวน์โหลดที่ตรวจสอบสิทธิ์แล้ว" : accessLevel === "AUTHENTICATED" ? "กรุณาเข้าสู่ระบบเพื่อดูตัวอย่างเอกสาร" : "เอกสารนี้จำกัดสิทธิ์สำหรับสมาชิกภาควิชา"}
            </DialogDescription>
          </DialogHeader>
          {canPreview ? <PdfPreviewFrame slug={slug} /> : <div className="flex min-h-48 items-center justify-center text-center text-muted-foreground">ไม่มีสิทธิ์ดูตัวอย่างเอกสารนี้</div>}
        </DialogContent>
      </Dialog>
    </>
  );
}
