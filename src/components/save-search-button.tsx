"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { saveSearch } from "@/app/my/actions";

export function SaveSearchButton({ queryString }: { queryString: string }) {
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const save = () => {
    const name = window.prompt("ตั้งชื่อชุดตัวกรองนี้");
    if (!name) return;
    startTransition(async () => { try { await saveSearch(name, queryString); setSaved(true); toast.success("บันทึกการค้นหาแล้ว"); } catch (error) { toast.error(error instanceof Error ? error.message : "ไม่สามารถบันทึกการค้นหาได้"); } });
  };
  return <Button type="button" variant="outline" size="sm" onClick={save} disabled={pending || saved}>{saved ? "บันทึกแล้ว" : "บันทึกการค้นหา"}</Button>;
}
