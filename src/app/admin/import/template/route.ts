import * as XLSX from "xlsx";
import { auth } from "@/../auth";
import { IMPORT_HEADERS } from "@/server/bulk-import";

export async function GET() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return Response.json({ message: "ไม่มีสิทธิ์ผู้ดูแลระบบ" }, { status: 403 });
  const worksheet = XLSX.utils.aoa_to_sheet([Array.from(IMPORT_HEADERS)]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "นำเข้า");
  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
  return new Response(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="up-cs-import-template.xlsx"',
    },
  });
}
