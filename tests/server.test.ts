import { describe, expect, it } from "vitest";
import { canDownload } from "@/lib/access";
import { buildPaperSearchQuery } from "@/server/papers";

describe("server data layer", () => {
  it("builds ranked Thai/English search SQL with filters", () => {
    const query = buildPaperSearchQuery({
      q: "ข้าว",
      year: 2567,
      areaSlug: "ai-machine-learning",
      advisorId: "advisor-1",
      techSlug: "python",
      sort: "newest",
      page: 2,
    });
    const sql = query.strings.join("?");
    expect(sql).toContain('ILIKE');
    expect(sql).toContain("similarity");
    expect(sql).toContain('"academicYear"');
    expect(sql).toContain('"advisorId"');
    expect(sql).toContain('"slug"');
    expect(sql).toContain("OFFSET");
  });

  it("uses download access levels and department roles correctly", () => {
    expect(canDownload({ accessLevel: "PUBLIC" }, null)).toBe(true);
    expect(canDownload({ accessLevel: "AUTHENTICATED" }, null)).toBe(false);
    expect(canDownload({ accessLevel: "AUTHENTICATED" }, { user: { role: "VIEWER" } })).toBe(true);
    expect(canDownload({ accessLevel: "DEPT_ONLY" }, { user: { role: "VIEWER" } })).toBe(false);
    expect(canDownload({ accessLevel: "DEPT_ONLY" }, { user: { role: "DEPT_MEMBER" } })).toBe(true);
  });

  it("defaults unsearched results to newest ordering", () => {
    const query = buildPaperSearchQuery({ sort: "newest", page: 1 });
    expect(query.strings.join("?")).toContain('"createdAt" DESC');
    expect(query.strings.join("?")).not.toContain("similarity");
  });
});
