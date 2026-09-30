import { describe, expect, it } from "vitest";
import { formatApa7, formatBibtex, formatIeee, formatRis } from "@/lib/citation";

const paper = {
  titleTh: "ระบบเกษตรอัจฉริยะ",
  titleEn: "Smart Agriculture System",
  academicYear: 2567,
  authors: [
    { firstNameTh: "พิมพ์ชนก", lastNameTh: "แก้วมา" },
    { firstNameTh: "ธนภัทร", lastNameTh: "วงศ์ใหญ่" },
  ],
};

describe("citation formatters", () => {
  it("formats Thai names and multiple authors in APA", () => {
    expect(formatApa7(paper)).toContain("พิมพ์ชนก แก้วมา และ ธนภัทร วงศ์ใหญ่. (2567).");
    expect(formatApa7(paper)).toContain("สาขาวิชาวิทยาการคอมพิวเตอร์");
  });

  it("falls back to the Thai title when English title is missing", () => {
    expect(formatIeee({ ...paper, titleEn: "" })).toContain("ระบบเกษตรอัจฉริยะ");
  });

  it("creates BibTeX and RIS with every author and no student id", () => {
    expect(formatBibtex(paper)).toContain("and");
    expect(formatBibtex(paper)).not.toContain("studentId");
    expect(formatRis(paper)).toContain("AU  - ธนภัทร วงศ์ใหญ่");
    expect(formatRis(paper)).toContain("TY  - THES");
  });
});
