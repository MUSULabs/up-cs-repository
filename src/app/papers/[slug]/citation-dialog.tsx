"use client";

import { useMemo, useState } from "react";
import { Clipboard, Download } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getCitationFormats, type CitationPaper } from "@/lib/citation";

export function CitationDialog({ paper }: { paper: CitationPaper }) {
  const formats = useMemo(() => getCitationFormats(paper), [paper]);
  const [open, setOpen] = useState(false);
  const copy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success("คัดลอกข้อมูลอ้างอิงแล้ว");
    } catch {
      toast.error("ไม่สามารถคัดลอกข้อมูลอ้างอิงได้");
    }
  };
  const download = (value: string, extension: "bib" | "ris") => {
    const blob = new Blob([value], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `citation.${extension}`;
    anchor.click();
    URL.revokeObjectURL(url);
    toast.success(`ดาวน์โหลดไฟล์ .${extension} แล้ว`);
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button type="button" variant="outline" />}>อ้างอิงงานวิจัยนี้</DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>อ้างอิงงานวิจัยนี้</DialogTitle>
          <DialogDescription>เลือกรูปแบบการอ้างอิงและคัดลอกไปใช้งาน</DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="apa">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="apa">APA 7</TabsTrigger>
            <TabsTrigger value="ieee">IEEE</TabsTrigger>
            <TabsTrigger value="bibtex">BibTeX</TabsTrigger>
            <TabsTrigger value="ris">RIS</TabsTrigger>
          </TabsList>
          {(["apa", "ieee", "bibtex", "ris"] as const).map((format) => (
            <TabsContent key={format} value={format} className="space-y-3">
              <pre className="max-h-56 overflow-auto whitespace-pre-wrap rounded-md bg-muted p-4 text-sm">{formats[format]}</pre>
              <div className="flex flex-wrap gap-2">
                <Button type="button" onClick={() => copy(formats[format])}><Clipboard className="size-4" />คัดลอก</Button>
                {format === "bibtex" && <Button type="button" variant="outline" onClick={() => download(formats.bibtex, "bib")}><Download className="size-4" />ดาวน์โหลด .bib</Button>}
                {format === "ris" && <Button type="button" variant="outline" onClick={() => download(formats.ris, "ris")}><Download className="size-4" />ดาวน์โหลด .ris</Button>}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
