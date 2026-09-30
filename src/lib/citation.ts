export type CitationAuthor = {
  firstNameTh: string;
  lastNameTh: string;
};

export type CitationPaper = {
  titleTh: string;
  titleEn?: string | null;
  academicYear: number;
  authors: CitationAuthor[];
};

function authorName(author: CitationAuthor) {
  return `${author.firstNameTh} ${author.lastNameTh}`.trim();
}

function title(paper: CitationPaper) {
  return paper.titleEn?.trim() || paper.titleTh;
}

function authorsApa(paper: CitationPaper) {
  const names = paper.authors.map(authorName);
  if (names.length <= 1) return names[0] || "ไม่ปรากฏชื่อผู้เขียน";
  if (names.length === 2) return names.join(" และ ");
  return `${names.slice(0, -1).join(", ")} และ ${names.at(-1)}`;
}

function authorsIeee(paper: CitationPaper) {
  const names = paper.authors.map(authorName);
  return names.length ? names.join(", ") : "ไม่ปรากฏชื่อผู้เขียน";
}

export function formatApa7(paper: CitationPaper) {
  return `${authorsApa(paper)}. (${paper.academicYear}). ${title(paper)}. ภาคนิพนธ์, สาขาวิชาวิทยาการคอมพิวเตอร์, มหาวิทยาลัยพะเยา.`;
}

export function formatIeee(paper: CitationPaper) {
  return `${authorsIeee(paper)}, "${title(paper)}," ภาคนิพนธ์, สาขาวิชาวิทยาการคอมพิวเตอร์, มหาวิทยาลัยพะเยา, ${paper.academicYear}.`;
}

function bibtexEscape(value: string) {
  return value.replace(/([\\{}])/g, "\\$1");
}

export function formatBibtex(paper: CitationPaper) {
  const key = `${paper.authors[0]?.lastNameTh || "paper"}${paper.academicYear}`;
  return `@misc{${key},\n  author = {${paper.authors.map(authorName).join(" and ")}},\n  title = {${bibtexEscape(title(paper))}},\n  year = {${paper.academicYear}},\n  note = {ภาคนิพนธ์, สาขาวิชาวิทยาการคอมพิวเตอร์, มหาวิทยาลัยพะเยา}\n}`;
}

export function formatRis(paper: CitationPaper) {
  const lines = ["TY  - THES"];
  for (const author of paper.authors) lines.push(`AU  - ${authorName(author)}`);
  lines.push(`TI  - ${title(paper)}`);
  lines.push(`PY  - ${paper.academicYear}`);
  lines.push("PB  - มหาวิทยาลัยพะเยา");
  lines.push("N1  - ภาคนิพนธ์, สาขาวิชาวิทยาการคอมพิวเตอร์");
  lines.push("ER  -");
  return lines.join("\n");
}

export function getCitationFormats(paper: CitationPaper) {
  return {
    apa: formatApa7(paper),
    ieee: formatIeee(paper),
    bibtex: formatBibtex(paper),
    ris: formatRis(paper),
  };
}
