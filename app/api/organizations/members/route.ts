import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const members = await prisma.organizationMember.findMany({
      where: { organizationId: user.organizationId },
      include: { user: true },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({
      members: members.map((member: any) => ({
        id: member.user.id,
        name: member.user.name,
        email: member.user.email,
        role: member.role,
      })),
    });
  } catch (error) {
    console.error("Failed to fetch organization members", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (user.role !== "ADMIN" || !user.organizationId) {
      return NextResponse.json({ error: "Only an organization admin can rename this organization" }, { status: 403 });
    }

    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    if (!name || name.length > 100) {
      return NextResponse.json({ error: "Organization name must be between 1 and 100 characters" }, { status: 400 });
    }

    const otherOrganizations = await prisma.organization.findMany({
      where: { id: { not: user.organizationId } },
      select: { name: true },
    });
    if (otherOrganizations.some((organization: { name: string }) => organization.name.trim().toLowerCase() === name.toLowerCase())) {
      return NextResponse.json({ error: "An organization with this name already exists" }, { status: 409 });
    }

    const organization = await prisma.organization.update({
      where: { id: user.organizationId },
      data: { name },
      select: { id: true, name: true },
    });
    return NextResponse.json({ success: true, organization });
  } catch (error) {
    console.error("Failed to update organization name", error);
    return NextResponse.json({ error: "Failed to update organization name" }, { status: 500 });
  }
}
