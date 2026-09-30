import { ImageResponse } from "next/og";
import { getPaperBySlug } from "@/server/papers";

export const alt = "UP-CS Research Repository";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

async function getThaiFont() {
  const css = await fetch("https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@400;700").then((response) => response.text());
  const fontUrl = css.match(/url\((https:\/\/[^)]+)\)/)?.[1];
  if (!fontUrl) return undefined;
  return fetch(fontUrl).then((response) => response.arrayBuffer());
}

export default async function OpenGraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const paper = await getPaperBySlug(slug);
  const isPublic = paper?.accessLevel === "PUBLIC";
  const font = await getThaiFont().catch(() => undefined);
  const title = isPublic ? paper.titleTh : "คลังภาคนิพนธ์ วิทยาการคอมพิวเตอร์";
  const year = isPublic ? String(paper.academicYear) : "มหาวิทยาลัยพะเยา";
  const advisor = isPublic && paper.advisors[0]
    ? `${paper.advisors[0].advisor.titleName}${paper.advisors[0].advisor.firstNameTh} ${paper.advisors[0].advisor.lastNameTh}`
    : "UP-CS Research Repository";

  return new ImageResponse(
    <div style={{ background: "#f8fafc", color: "#0f172a", display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between", padding: "72px", width: "100%" }}>
      <div style={{ color: "#2563eb", display: "flex", fontSize: 28, fontWeight: 700 }}>UP-CS Research Repository</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div style={{ display: "flex", fontSize: 54, fontWeight: 700, lineHeight: 1.25, maxWidth: 1060 }}>{title}</div>
        <div style={{ color: "#475569", display: "flex", fontSize: 30 }}>{year} · {advisor}</div>
      </div>
      <div style={{ color: "#64748b", display: "flex", fontSize: 24 }}>สาขาวิชาวิทยาการคอมพิวเตอร์ มหาวิทยาลัยพะเยา</div>
    </div>,
    { ...size, fonts: font ? [{ name: "Noto Sans Thai", data: font, weight: 400 }, { name: "Noto Sans Thai", data: font, weight: 700 }] : undefined },
  );
}
