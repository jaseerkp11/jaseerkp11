import { NextRequest } from "next/server";
import { clearSession } from "@/lib/auth";
import { getBrand } from "@/config/brand";

export async function POST(request: NextRequest) {
  await clearSession();
  return Response.redirect(new URL("/", getBrand().siteUrl || request.url), 303);
}
