import { saveTaxonomy } from "./actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";

export async function TaxonomyPage({ kind, title, type }: { kind: "area" | "keyword" | "technology"; title: string; type: "area" | "keyword" | "technology" }) {
  const items = type === "area"
    ? await prisma.researchArea.findMany({ select: { id: true, nameTh: true, nameEn: true, slug: true }, orderBy: { nameTh: "asc" } })
    : type === "keyword"
      ? await prisma.keyword.findMany({ select: { id: true, nameTh: true, nameEn: true, slug: true }, orderBy: { nameTh: "asc" } })
      : await prisma.technology.findMany({ select: { id: true, name: true, slug: true }, orderBy: { name: "asc" } }).then((rows) => rows.map((row) => ({ ...row, nameTh: row.name, nameEn: "" })));
  return <div className="space-y-6"><h1 className="text-3xl font-bold">{title}</h1><form action={saveTaxonomy.bind(null, kind)} className="flex flex-wrap gap-2 rounded-lg border bg-card p-4"><Input name="nameTh" placeholder="ชื่อภาษาไทย" required /><Input name="nameEn" placeholder="ชื่อภาษาอังกฤษ" /><Input name="slug" placeholder="slug" required /><Button type="submit">เพิ่มรายการ</Button></form><Card><CardContent className="p-0">{items.length === 0 ? <p className="p-8 text-center text-sm text-muted-foreground">ยังไม่มีข้อมูล</p> : <table className="w-full text-sm"><thead className="border-b bg-muted/50"><tr><th className="p-3 text-left">ชื่อ</th><th className="p-3 text-left">Slug</th></tr></thead><tbody>{items.map((item) => <tr key={item.id} className="border-b last:border-0"><td className="p-3">{item.nameTh}</td><td className="p-3 text-muted-foreground">{item.slug}</td></tr>)}</tbody></table>}</CardContent></Card></div>;
}
