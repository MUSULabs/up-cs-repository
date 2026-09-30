import { savePaper } from "../../actions";
import { PaperForm } from "../paper-form";
import { getAdminOptions } from "@/server/admin";
export default async function NewPaper() {
  const [areas, authors, advisors, keywords, technologies] = await getAdminOptions();
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">เพิ่มภาคนิพนธ์</h1>
      <PaperForm action={savePaper} options={{
        areas: areas.map((x) => ({ id: x.id, name: x.nameTh })),
        authors: authors.map((x) => ({ id: x.id, name: `${x.firstNameTh} ${x.lastNameTh}` })),
        advisors: advisors.map((x) => ({ id: x.id, name: `${x.titleName}${x.firstNameTh} ${x.lastNameTh}` })),
        keywords: keywords.map((x) => ({ id: x.id, name: x.nameTh })),
        technologies: technologies.map((x) => ({ id: x.id, name: x.name })),
      }} />
    </div>
  );
}
