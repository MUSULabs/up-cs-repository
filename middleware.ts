import { NextResponse } from "next/server";

import { auth } from "./auth";

export default auth((request) => {
  const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");
  const isAuthenticatedRoute = request.nextUrl.pathname.startsWith("/my") || request.nextUrl.pathname === "/compare" || request.nextUrl.pathname === "/submit";
  if ((isAdminRoute && request.auth?.user?.role === "ADMIN") || (isAuthenticatedRoute && request.auth?.user)) return NextResponse.next();

  const callbackUrl = `${request.nextUrl.pathname}${request.nextUrl.search}`;
  const loginUrl = new URL("/login", request.nextUrl.origin);
  loginUrl.searchParams.set("callbackUrl", callbackUrl);
  return NextResponse.redirect(loginUrl);
});

export const config = {
  matcher: ["/admin/:path*", "/my/:path*", "/compare", "/submit"],
};
