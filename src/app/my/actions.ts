"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/../auth";
import { prisma } from "@/lib/prisma";

async function userId() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("กรุณาเข้าสู่ระบบ");
  return session.user.id;
}

export async function toggleBookmark(paperId: string) {
  const id = await userId();
  const existing = await prisma.bookmark.findUnique({ where: { userId_paperId: { userId: id, paperId } } });
  if (existing) {
    await prisma.bookmark.delete({ where: { userId_paperId: { userId: id, paperId } } });
    return { bookmarked: false };
  }
  await prisma.bookmark.create({ data: { userId: id, paperId } });
  return { bookmarked: true };
}

export async function saveBookmarkNote(formData: FormData) {
  const id = await userId();
  const paperId = String(formData.get("paperId") ?? "");
  const note = String(formData.get("note") ?? "").trim() || null;
  await prisma.bookmark.update({ where: { userId_paperId: { userId: id, paperId } }, data: { note } });
  revalidatePath("/my/bookmarks");
}

export async function saveSearch(name: string, queryString: string) {
  const id = await userId();
  if (!name.trim() || !queryString.trim()) throw new Error("กรุณาระบุชื่อการค้นหา");
  await prisma.savedSearch.create({ data: { userId: id, name: name.trim(), queryString } });
  revalidatePath("/my/searches");
  return { ok: true };
}

export async function deleteSavedSearch(id: string) {
  const user = await userId();
  await prisma.savedSearch.deleteMany({ where: { id, userId: user } });
  revalidatePath("/my/searches");
}
