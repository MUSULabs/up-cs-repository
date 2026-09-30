import { prisma } from "@/lib/prisma";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { saveAdvisor } from "../actions";
export default async function AdvisorsPage() {
  const advisors = await prisma.advisor.findMany({ select: { id: true, titleName: true, firstNameTh: true, lastNameTh: true, isActive: true }, orderBy: { lastNameTh: "asc" } });
  return <div className="space-y-6"><h1 className="text-3xl font-bold">อาจารย์ที่ปรึกษา</h1>
    <form action={saveAdvisor} className="grid gap-2 rounded-lg border bg-card p-4 sm:grid-cols-5">
      <Input name="titleName" placeholder="คำนำหน้า" required /><Input name="firstNameTh" placeholder="ชื่อ" required /><Input name="lastNameTh" placeholder="นามสกุล" required /><Input name="email" type="email" placeholder="อีเมล (ถ้ามี)" /><Button type="submit">เพิ่มอาจารย์</Button>
    </form>
    <div className="overflow-x-auto rounded-lg border bg-card">{advisors.length === 0 ? <p className="p-8 text-center text-sm text-muted-foreground">ยังไม่มีข้อมูลอาจารย์</p> : <table className="w-full text-sm"><thead className="border-b bg-muted/50"><tr><th className="p-3 text-left">ชื่อ</th><th className="p-3 text-left">สถานะ</th></tr></thead><tbody>{advisors.map((item) => <tr key={item.id} className="border-b last:border-0"><td className="p-3">{item.titleName}{item.firstNameTh} {item.lastNameTh}</td><td className="p-3">{item.isActive ? "ใช้งาน" : "ไม่ใช้งาน"}</td></tr>)}</tbody></table>}</div>
  </div>;
}
