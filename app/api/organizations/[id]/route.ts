import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (user?.role !== "SUPER_ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await context.params;
  const body = await request.json();
  if (typeof body.isActive !== "boolean") {
    return NextResponse.json({ error: "Organization status must be active or inactive" }, { status: 400 });
  }

  const existing = await prisma.organization.findUnique({ where: { id }, select: { activatedAt: true } });
  if (!existing) return NextResponse.json({ error: "Organization not found" }, { status: 404 });

  const organization = await prisma.organization.update({
    where: { id },
    data: {
      isActive: body.isActive,
      activatedAt: existing.activatedAt ?? new Date(),
    },
    select: { id: true, name: true, isActive: true, activatedAt: true },
  });
  return NextResponse.json({ success: true, organization });
}
