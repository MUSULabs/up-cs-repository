import { NextResponse } from "next/server";

import { auth } from "./auth";

export default auth((request) => {
  if (request.auth?.user?.role === "ADMIN") return NextResponse.next();

  const callbackUrl = `${request.nextUrl.pathname}${request.nextUrl.search}`;
  const loginUrl = new URL("/login", request.nextUrl.origin);
  loginUrl.searchParams.set("callbackUrl", callbackUrl);
  return NextResponse.redirect(loginUrl);
});

export const config = {
  matcher: ["/admin/:path*"],
};
