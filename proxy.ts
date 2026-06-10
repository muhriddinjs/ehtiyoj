import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

const PROTECTED_ROUTES = ["/zarurat", "/masjid"];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isProtected = PROTECTED_ROUTES.some((r) => pathname.startsWith(r));

  if (isProtected) {
    const token = req.cookies.get("extiyoj_session")?.value;
    if (!token) {
      const loginUrl = new URL(`/auth?from=${encodeURIComponent(pathname)}`, req.url);
      return NextResponse.redirect(loginUrl);
    }
    try {
      await verifyToken(token);
    } catch {
      const loginUrl = new URL(`/auth?from=${encodeURIComponent(pathname)}`, req.url);
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete("extiyoj_session");
      return response;
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/zarurat/:path*", "/masjid/:path*"],
};
