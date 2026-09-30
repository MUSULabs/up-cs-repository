import Link from "next/link";
import { redirect } from "next/navigation";
import { LayoutDashboard, Library, LogOut, Settings, Users } from "lucide-react";
import { auth, signOut } from "@/../auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/login?callbackUrl=/admin");
  return <div className="min-h-screen bg-muted/30"><header className="border-b bg-card"><div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4"><Link href="/admin" className="font-bold text-primary">หลังบ้าน UP-CS</Link><form action={async () => { "use server"; await signOut({ redirectTo: "/" }); }}><button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><LogOut className="size-4" />ออกจากระบบ</button></form></div></header><div className="mx-auto grid max-w-7xl md:grid-cols-[14rem_1fr]"><aside className="border-r bg-card p-4"><nav className="space-y-1 text-sm">{[["/admin", "แดชบอร์ด", LayoutDashboard], ["/admin/papers", "ภาคนิพนธ์", Library], ["/admin/advisors", "อาจารย์ที่ปรึกษา", Users], ["/admin/areas", "หมวดงานวิจัย", Settings], ["/admin/keywords", "คำสำคัญ", Settings], ["/admin/technologies", "เทคโนโลยี", Settings], ["/admin/users", "ผู้ใช้งาน", Users]].map(([href, label, Icon]) => <Link key={String(href)} href={String(href)} className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-muted"><Icon className="size-4" />{String(label)}</Link>)}</nav></aside><main className="min-w-0 p-4 sm:p-8">{children}</main></div></div>;
}
