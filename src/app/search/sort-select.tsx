"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

type SortSelectProps = {
  value: "relevance" | "newest" | "most-downloaded";
  hasQuery: boolean;
};

export function SortSelect({ value, hasQuery }: SortSelectProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function changeSort(nextValue: string) {
    const next = new URLSearchParams(searchParams.toString());
    next.set("sort", nextValue);
    next.set("page", "1");
    router.push(`${pathname}?${next.toString()}`);
  }

  return (
    <select
      value={value}
      onChange={(event) => changeSort(event.target.value)}
      className="h-9 rounded-md border bg-background px-3 text-sm"
      aria-label="เรียงลำดับ"
    >
      {hasQuery && <option value="relevance">ตรงกับคำค้นมากที่สุด</option>}
      <option value="newest">ใหม่ล่าสุด</option>
      <option value="most-downloaded">ดาวน์โหลดมากที่สุด</option>
    </select>
  );
}
