"use client";

import { useState, useTransition } from "react";
import { Bookmark } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { toggleBookmark } from "@/app/my/actions";

export function BookmarkButton({ paperId, initialBookmarked, compact = false }: { paperId: string; initialBookmarked: boolean; compact?: boolean }) {
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [pending, startTransition] = useTransition();
  const toggle = () => {
    const next = !bookmarked;
    setBookmarked(next);
    startTransition(async () => {
      try { const result = await toggleBookmark(paperId); setBookmarked(result.bookmarked); toast.success(result.bookmarked ? "บันทึกภาคนิพนธ์แล้ว" : "นำออกจากรายการบันทึกแล้ว"); }
      catch (error) { setBookmarked(!next); toast.error(error instanceof Error ? error.message : "ไม่สามารถบันทึกได้"); }
    });
  };
  return <Button type="button" variant="outline" size={compact ? "icon" : "default"} onClick={toggle} disabled={pending} aria-label={bookmarked ? "นำออกจากรายการบันทึก" : "บันทึกภาคนิพนธ์"} title={bookmarked ? "นำออกจากรายการบันทึก" : "บันทึกภาคนิพนธ์"}><Bookmark className={`size-4 ${bookmarked ? "fill-current text-primary" : ""}`} />{!compact && (bookmarked ? "บันทึกแล้ว" : "บันทึก")}</Button>;
}
