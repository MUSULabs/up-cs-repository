import { notFound } from "next/navigation";
import { savePaper } from "../../../actions";
import { PaperForm } from "../../paper-form";
import { getAdminOptions, getAdminPaper } from "@/server/admin";
type Props = { params: Promise<{ id: string }> };
export default async function EditPaper({ params }: Props) {
  const { id } = await params;
  const [paper, optionRows] = await Promise.all([getAdminPaper(id), getAdminOptions()]);
  if (!paper) notFound();
  const [areas, authors, advisors, keywords, technologies] = optionRows;
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">แก้ไขภาคนิพนธ์</h1>
      <PaperForm action={savePaper} paper={{
        ...paper,
        hasPdf: Boolean(paper.pdfUrl),
        pdfUrl: undefined,
        authorIds: paper.authors.map((x) => x.author.id),
        advisorIds: paper.advisors.map((x) => x.advisor.id),
        keywordIds: paper.keywords.map((x) => x.keyword.id),
        technologyIds: paper.technologies.map((x) => x.technology.id),
      }} options={{
        areas: areas.map((x) => ({ id: x.id, name: x.nameTh })),
        authors: authors.map((x) => ({ id: x.id, name: `${x.firstNameTh} ${x.lastNameTh}` })),
        advisors: advisors.map((x) => ({ id: x.id, name: `${x.titleName}${x.firstNameTh} ${x.lastNameTh}` })),
        keywords: keywords.map((x) => ({ id: x.id, name: x.nameTh })),
        technologies: technologies.map((x) => ({ id: x.id, name: x.name })),
      }} />
    </div>
  );
}
