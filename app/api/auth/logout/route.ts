import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/auth";

export async function POST() {
  const response = NextResponse.json({ success: true });
  const cookie = clearSessionCookie();
  response.cookies.set(cookie);
  return response;
}
