"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

export function CompareSelector({ paperId, selected }: { paperId: string; selected: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const ids = (params.get("compare") ?? "").split(",").filter(Boolean);
  const toggle = () => {
    const next = selected ? ids.filter((id) => id !== paperId) : [...ids, paperId].slice(-3);
    const query = new URLSearchParams(params.toString());
    if (next.length) query.set("compare", next.join(",")); else query.delete("compare");
    router.replace(`${pathname}?${query.toString()}`, { scroll: false });
  };
  return <input type="checkbox" checked={selected} onChange={toggle} className="size-4 accent-primary" aria-label="เลือกเพื่อเปรียบเทียบ" />;
}

export function CompareBar({ ids }: { ids: string[] }) {
  if (!ids.length) return null;
  return <div className="sticky bottom-4 z-10 mt-5 flex items-center justify-between gap-3 rounded-lg border bg-card p-3 shadow-lg"><span className="text-sm">เลือกแล้ว {ids.length}/3 รายการ</span><Button render={<Link href={`/compare?ids=${ids.join(",")}`} />} disabled={ids.length < 2}>เปรียบเทียบ</Button></div>;
}
