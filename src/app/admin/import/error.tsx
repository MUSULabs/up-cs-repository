"use client";

export default function Error({ reset }: { reset: () => void }) {
  return <div className="rounded-lg border border-destructive/30 bg-card p-8 text-center"><h2 className="text-xl font-semibold">โหลดหน้านำเข้าไม่สำเร็จ</h2><button className="mt-4 underline" onClick={reset}>ลองใหม่</button></div>;
}
