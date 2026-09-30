import { redirect } from "next/navigation";
import { auth } from "@/../auth";
import { getAdminOptions } from "@/server/admin";
import { SubmissionForm } from "./submission-form";
import { getSubmissionForEdit } from "./actions";

export default async function SubmitPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const session = await auth();
  if (!session?.user?.email?.toLowerCase().endsWith("@up.ac.th")) redirect("/login?callbackUrl=/submit");
  const [areas, authors, advisors, keywords, technologies] = await getAdminOptions();
  const id = (await searchParams).id;
  const paper = id ? await getSubmissionForEdit(id) : null;
  return <main className="mx-auto max-w-5xl px-4 py-10"><h1 className="text-3xl font-bold">{paper ? "แก้ไขและส่งภาคนิพนธ์ใหม่" : "ส่งภาคนิพนธ์"}</h1><p className="mt-2 text-muted-foreground">กรอกข้อมูลและบันทึกเป็นฉบับร่างได้ก่อนส่งให้เจ้าหน้าที่ตรวจสอบ</p><SubmissionForm paper={paper} options={{ areas: areas.map((item) => ({ id: item.id, name: item.nameTh })), authors: authors.map((item) => ({ id: item.id, name: `${item.firstNameTh} ${item.lastNameTh}` })), advisors: advisors.map((item) => ({ id: item.id, name: `${item.titleName}${item.firstNameTh} ${item.lastNameTh}` })), keywords: keywords.map((item) => ({ id: item.id, name: item.nameTh })), technologies: technologies.map((item) => ({ id: item.id, name: item.name })) }} /></main>;
}
