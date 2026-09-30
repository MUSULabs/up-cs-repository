"use client";
export default function Error({ reset }: { reset: () => void }) { return <div className="p-10 text-center"><h2 className="text-xl font-semibold">โหลดรายการตรวจสอบไม่สำเร็จ</h2><button className="mt-4 underline" onClick={reset}>ลองใหม่</button></div>; }
