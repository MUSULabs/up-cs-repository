import type { AccessLevel, Role } from "@/generated/prisma/enums";

export type DownloadSession =
  | { user?: { role?: Role | string | null } | null }
  | null
  | undefined;

export type AccessPaper = {
  accessLevel: AccessLevel | string;
};

export function canDownload(
  paper: AccessPaper,
  session: DownloadSession,
): boolean {
  if (paper.accessLevel === "PUBLIC") return true;
  if (!session?.user) return false;
  if (paper.accessLevel === "AUTHENTICATED") return true;
  return (
    paper.accessLevel === "DEPT_ONLY" &&
    (session.user.role === "DEPT_MEMBER" || session.user.role === "ADMIN")
  );
}

type SensitiveAuthor = {
  studentId?: string | null;
  email?: string | null;
  [key: string]: unknown;
};

type PaperWithSensitiveAuthors = {
  authors?: Array<{ author: SensitiveAuthor; [key: string]: unknown }>;
  [key: string]: unknown;
};

export function sanitizePaper<T extends PaperWithSensitiveAuthors>(
  paper: T,
): Omit<T, "authors"> & {
  authors?: Array<
    Omit<T["authors"] extends Array<infer A> ? A : never, "author"> & {
      author: Omit<SensitiveAuthor, "studentId" | "email">;
    }
  >;
} {
  const { authors, ...paperFields } = paper;
  if (!authors) return paperFields as Omit<T, "authors">;

  return {
    ...paperFields,
    authors: authors.map(({ author, ...join }) => {
      const publicAuthor = { ...author };
      delete publicAuthor.studentId;
      delete publicAuthor.email;
      return { ...join, author: publicAuthor };
    }),
  } as Omit<T, "authors"> & {
    authors: Array<
      Omit<T["authors"] extends Array<infer A> ? A : never, "author"> & {
        author: Omit<SensitiveAuthor, "studentId" | "email">;
      }
    >;
  };
}
