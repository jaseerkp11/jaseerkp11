import { NextRequest } from "next/server";

export function redirectTo(request: NextRequest, path: string, status = 303) {
  return Response.redirect(new URL(path, request.url), status);
}
