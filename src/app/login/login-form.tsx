"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm({ callbackUrl, rejected }: { callbackUrl: string; rejected: boolean }) {
  const [showAdmin, setShowAdmin] = useState(false);
  const [error, setError] = useState(rejected ? "บัญชี Google ต้องใช้อีเมล @up.ac.th เท่านั้น" : "");
  const [pending, setPending] = useState(false);

  async function handleGoogle() {
    setPending(true);
    await signIn("google", { callbackUrl });
  }

  async function handleCredentials(formData: FormData) {
    setPending(true);
    setError("");
    const result = await signIn("credentials", {
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
      redirect: false,
      callbackUrl,
    });
    if (result?.error) {
      setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง หรือบัญชีนี้ไม่มีสิทธิ์ผู้ดูแลระบบ");
      setPending(false);
      return;
    }
    window.location.assign(result?.url ?? callbackUrl);
  }

  return (
    <div className="space-y-5">
      {error && <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
      <Button type="button" onClick={handleGoogle} disabled={pending} className="h-11 w-full">
        {pending ? "กำลังดำเนินการ..." : "เข้าสู่ระบบด้วย Google (@up.ac.th)"}
      </Button>
      <div className="relative py-2 text-center text-xs text-muted-foreground"><span className="relative z-10 bg-card px-3">หรือ</span><span className="absolute inset-x-0 top-1/2 border-t" /></div>
      <button type="button" onClick={() => setShowAdmin((value) => !value)} className="w-full text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
        {showAdmin ? "ซ่อนการเข้าสู่ระบบผู้ดูแลระบบ" : "เข้าสู่ระบบสำหรับผู้ดูแลระบบ"}
      </button>
      {showAdmin && (
        <form action={handleCredentials} className="space-y-4 rounded-lg border bg-muted/30 p-4">
          <div className="space-y-2"><Label htmlFor="email">อีเมลผู้ดูแลระบบ</Label><Input id="email" name="email" type="email" required autoComplete="email" /></div>
          <div className="space-y-2"><Label htmlFor="password">รหัสผ่าน</Label><Input id="password" name="password" type="password" required autoComplete="current-password" /></div>
          <Button type="submit" disabled={pending} className="w-full">{pending ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}</Button>
        </form>
      )}
    </div>
  );
}
