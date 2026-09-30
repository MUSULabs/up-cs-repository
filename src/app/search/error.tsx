"use client";

export default function Error({ reset }: { reset: () => void }) {
  return <div className="mx-auto max-w-2xl px-4 py-16 text-center"><h1 className="text-2xl font-bold">ค้นหาข้อมูลไม่สำเร็จ</h1><p className="mt-2 text-muted-foreground">กรุณาลองใหม่อีกครั้ง</p><button className="mt-6 rounded-md bg-primary px-4 py-2 text-primary-foreground" onClick={reset}>ลองอีกครั้ง</button></div>;
}
