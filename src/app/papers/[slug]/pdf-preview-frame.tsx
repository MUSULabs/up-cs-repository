"use client";

export function PdfPreviewFrame({ slug }: { slug: string }) {
  return (
    <iframe
      title="ตัวอย่างเอกสาร PDF"
      src={`/api/papers/${encodeURIComponent(slug)}/download#toolbar=0`}
      className="h-[70vh] w-full rounded-md border"
    />
  );
}
