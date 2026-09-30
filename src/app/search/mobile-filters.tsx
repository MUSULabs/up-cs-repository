"use client";

import type { ReactNode } from "react";
import { SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function MobileFilters({ children }: { children: ReactNode }) {
  return (
    <Sheet>
      <SheetTrigger render={<Button variant="outline" className="md:hidden" />}>
        <SlidersHorizontal className="size-4" />
        ตัวกรอง
      </SheetTrigger>
      <SheetContent side="left" className="w-[min(22rem,90vw)] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>ตัวกรองผลการค้นหา</SheetTitle>
        </SheetHeader>
        <div className="px-4 pb-6">{children}</div>
      </SheetContent>
    </Sheet>
  );
}
