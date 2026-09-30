"use client";
export default function Error({ reset }: { reset: () => void }) { return <div className="mx-auto max-w-3xl p-10 text-center"><h2 className="text-xl font-semibold">ไม่สามารถโหลดรายการบันทึกได้</h2><button className="mt-4 underline" onClick={reset}>ลองใหม่</button></div>; }
