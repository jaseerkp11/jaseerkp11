import { NextRequest } from "next/server";
import { shippingProvider } from "@/lib/shipping/provider";
import { pincodeSchema, jsonError } from "@/lib/validation";

export async function GET(request: NextRequest) {
  const parsed = pincodeSchema.safeParse(request.nextUrl.searchParams.get("pincode") ?? "");
  if (!parsed.success) return jsonError("Enter a valid 6-digit pincode", 400);
  const quotes = await shippingProvider.quote(parsed.data);
  return Response.json({ quotes });
}
