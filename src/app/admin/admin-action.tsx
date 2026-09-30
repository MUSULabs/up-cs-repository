"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function ArchiveButton({ action, id }: { action: (id: string) => Promise<{ ok: boolean }>; id: string }) {
  const [pending, startTransition] = useTransition();
  return <Button variant="outline" size="sm" disabled={pending} onClick={() => { if (!window.confirm("ยืนยันการเก็บถาวรภาคนิพนธ์นี้หรือไม่")) return; startTransition(async () => { await action(id); toast.success("เก็บถาวรเรียบร้อย"); }); }}>เก็บถาวร</Button>;
}
