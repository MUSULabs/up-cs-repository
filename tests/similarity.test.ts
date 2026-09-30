import { describe, expect, it } from "vitest";
import { scoreSimilarity, similarityVerdict, tokenize } from "@/lib/similarity";

describe("topic similarity", () => {
  it("combines title, keyword, and technology overlap into a bounded score", () => {
    const result = scoreSimilarity({
      titleSimilarity: 0.8,
      proposedTerms: ["ระบบจำแนกโรคใบข้าว", "การเรียนรู้เชิงลึก"],
      paperTitle: "ระบบจำแนกโรคใบข้าวด้วยการเรียนรู้เชิงลึก",
      paperKeywords: ["โรคใบข้าว", "การเรียนรู้เชิงลึก"],
      proposedTechnologies: ["Python", "YOLOv8"],
      paperTechnologies: ["Python", "YOLOv8"],
    });
    expect(result.score).toBeGreaterThan(70);
    expect(result.matchedTerms).toContain("โรคใบข้าว");
    expect(result.matchedTechnologies).toEqual(expect.arrayContaining(["python", "yolov8"]));
  });

  it("returns the requested Thai verdict thresholds", () => {
    expect(similarityVerdict(71).message).toBe("หัวข้อนี้เคยมีคนทำแล้ว ควรปรับมุมมอง");
    expect(similarityVerdict(40).message).toBe("มีงานใกล้เคียง ควรอ่านก่อน");
    expect(similarityVerdict(39).message).toBe("ยังไม่พบงานที่ใกล้เคียง");
  });

  it("tokenizes terms without exposing unrelated fields", () => {
    expect(tokenize("ระบบ IoT, Python")).toEqual(["ระบบ", "iot", "python"]);
  });
});
