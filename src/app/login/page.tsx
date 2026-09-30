import Link from "next/link";
import { BookOpen } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "./login-form";

type LoginPageProps = {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const callbackUrl = params.callbackUrl?.startsWith("/") ? params.callbackUrl : "/";
  const rejected = params.error === "AccessDenied";

  return (
    <main className="flex flex-1 items-center justify-center bg-muted/30 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link href="/" className="mx-auto mb-3 flex items-center gap-2 text-primary"><BookOpen className="size-6" /><span className="font-semibold">UP-CS Research Repository</span></Link>
          <CardTitle className="text-2xl">เข้าสู่ระบบ</CardTitle>
          <p className="text-sm text-muted-foreground">สำหรับสมาชิกและผู้ดูแลคลังภาคนิพนธ์</p>
        </CardHeader>
        <CardContent><LoginForm callbackUrl={callbackUrl} rejected={rejected} /></CardContent>
      </Card>
    </main>
  );
}
