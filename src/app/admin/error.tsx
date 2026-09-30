"use client";

export default function Error({ reset }: { reset: () => void }) {
  return <div className="rounded-lg border bg-card p-8 text-center"><h1 className="text-xl font-bold">โหลดข้อมูลหลังบ้านไม่สำเร็จ</h1><button className="mt-4 rounded-md bg-primary px-4 py-2 text-primary-foreground" onClick={reset}>ลองอีกครั้ง</button></div>;
}
