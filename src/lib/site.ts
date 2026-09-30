const configuredUrl = process.env.NEXTAUTH_URL || process.env.SITE_URL || "http://localhost:3000";

export const siteUrl = configuredUrl.replace(/\/+$/, "");

export function absoluteUrl(path: string) {
  return new URL(path, `${siteUrl}/`).toString();
}
