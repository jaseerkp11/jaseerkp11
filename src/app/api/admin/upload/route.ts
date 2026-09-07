import { NextRequest } from "next/server";
import { getSessionUser, assertStaff } from "@/lib/auth";
import { writeAudit } from "@/lib/audit";

export const maxSize = 5 * 1024 * 1024;

export async function POST(request: NextRequest) {
  const session = await getSessionUser();
  try {
    assertStaff(session);
  } catch {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await request.formData();
  const file = form.get("file") as File | null;
  if (!file) {
    return Response.json({ error: "No file provided" }, { status: 400 });
  }

  if (file.size > maxSize) {
    return Response.json({ error: "File too large (max 5MB)" }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const base64 = buffer.toString("base64");
  const dataUrl = `data:${file.type};base64,${base64}`;

  await writeAudit({
    actorId: session!.id,
    action: "image.upload",
    entity: "ProductImage",
    entityId: dataUrl,
    metadata: { size: file.size, type: file.type },
  });

  return Response.json({ url: dataUrl, type: file.type });
}
