import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const STAFF = new Set(["STAFF", "ADMIN", "SUPER_ADMIN"]);

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("store_session")?.value;
  const login = new URL("/login", request.url);
  login.searchParams.set("next", request.nextUrl.pathname);

  if (!token) {
    return NextResponse.redirect(login);
  }

  try {
    const secret = process.env.AUTH_SECRET;
    if (!secret) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
    const role = typeof payload.role === "string" ? payload.role : "";
    if (!STAFF.has(role)) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  } catch {
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
