import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser, isConfiguredSuperAdmin } from "@/lib/session";
import type { Prisma } from "@prisma/client";

async function requireSuperAdmin() {
  const user = await getSessionUser();
  return user?.role === "SUPER_ADMIN" ? user : null;
}

export async function GET(request: NextRequest) {
  try {
    const actor = await requireSuperAdmin();
    if (!actor) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const params = request.nextUrl.searchParams;
  const page = Math.max(1, Number(params.get("page") || 1));
  const pageSize = Math.min(100, Math.max(1, Number(params.get("pageSize") || 10)));
  const search = params.get("search")?.trim();
  const organizationId = params.get("organizationId");
  const active = params.get("active");

  const allOrganizations = await prisma.organization.findMany({ select: { id: true, name: true, isActive: true, activatedAt: true }, orderBy: { name: "asc" } });
  const selectedOrganization = allOrganizations.find((item: { id: string }) => item.id === organizationId);
  const matchingOrganizationIds = selectedOrganization
    ? allOrganizations.filter((item: { name: string }) => item.name.trim().toLocaleLowerCase() === selectedOrganization.name.trim().toLocaleLowerCase()).map((item: { id: string }) => item.id)
    : [];
  const memberships = await prisma.organizationMember.findMany({
    where: organizationId ? { organizationId: { in: matchingOrganizationIds } } : undefined,
    select: { userId: true },
  });
  const membershipIds: string[] = memberships.map((item: { userId: string }) => String(item.userId));
  const scopedIds: string[] | undefined = organizationId ? Array.from(new Set<string>(membershipIds)) : undefined;
  const where: Prisma.UserWhereInput = {
    ...(scopedIds ? { id: { in: scopedIds } } : {}),
    ...(active === "false" ? { isActive: false } : {}),
    ...(active === "true" ? { AND: [{ OR: [{ isActive: true }, { isActive: null }] }] } : {}),
    ...(search ? { OR: [{ name: { contains: search } }, { email: { contains: search } }] } : {}),
  };

  const [total, records] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * pageSize, take: pageSize,
      select: { id: true, name: true, email: true, isActive: true, passwordResetEnabled: true, createdAt: true } }),
  ]);
  const membershipsByUser = records.length ? await prisma.organizationMember.findMany({
    where: { userId: { in: records.map((record) => record.id) } },
    include: { organization: { select: { id: true, name: true, inviteCode: true, isActive: true, activatedAt: true } } },
    orderBy: { createdAt: "asc" },
  }) : [];

    return NextResponse.json({
    users: records.map((record) => {
      const userMemberships = membershipsByUser.filter((item: { userId: string }) => item.userId === record.id);
      const membership = userMemberships.find((item: { organizationId: string }) => matchingOrganizationIds.includes(item.organizationId)) ?? userMemberships[0];
      return { id: record.id, name: record.name, email: record.email,
        organizationId: membership?.organizationId, organizationName: membership?.organization.name ?? "—",
        organizationInviteCode: membership?.organization.inviteCode,
        organizationActive: membership?.organization.isActive !== false,
        organizationStatus: membership?.organization.isActive !== false
          ? "ACTIVE"
          : membership?.organization.activatedAt
            ? "INACTIVE"
            : "PENDING",
        role: isConfiguredSuperAdmin(record.id) ? "SUPER_ADMIN" : membership?.role ?? "USER",
        active: record.isActive !== false, passwordResetEnabled: record.passwordResetEnabled === true, createdAt: record.createdAt };
    }),
    organizations: Array.from(new Map(allOrganizations.map((item: { id: string; name: string }) => [item.name.trim().toLocaleLowerCase(), item])).values()),
    organizationOptions: allOrganizations.map((item: { id: string; name: string }) => ({
      ...item,
      label: allOrganizations.filter((other: { name: string }) => other.name.trim().toLocaleLowerCase() === item.name.trim().toLocaleLowerCase()).length > 1
        ? `${item.name} (${item.id.slice(-4)})`
        : item.name,
    })),
    pagination: { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) },
    });
  } catch (error) {
    console.error("Failed to load Super Admin users", error);
    return NextResponse.json({ error: "Could not load users. Please retry after refreshing the app." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  if (!(await requireSuperAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await request.json();
  const { userId, role, active, name, email, organizationId, passwordResetEnabled, organizationStatus } = body as { userId?: string; role?: string; active?: boolean; name?: string; email?: string; organizationId?: string; passwordResetEnabled?: boolean; organizationStatus?: "PENDING" | "ACTIVE" | "INACTIVE" };
  if (!userId || (role !== undefined && !["ADMIN", "USER"].includes(role)) || (active !== undefined && typeof active !== "boolean") || (passwordResetEnabled !== undefined && typeof passwordResetEnabled !== "boolean") || (organizationStatus !== undefined && !["PENDING", "ACTIVE", "INACTIVE"].includes(organizationStatus)) || (name !== undefined && !name.trim()) || (email !== undefined && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) {
    return NextResponse.json({ error: "Invalid user update" }, { status: 400 });
  }
  const target = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, email: true } });
  if (!target) return NextResponse.json({ error: "User not found" }, { status: 404 });
  if (isConfiguredSuperAdmin(target.id)) return NextResponse.json({ error: "Configured Super Admin accounts cannot be changed here" }, { status: 403 });
  if (organizationId) {
    const destination = await prisma.organization.findUnique({ where: { id: organizationId }, select: { id: true } });
    if (!destination) return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    const destinationMembership = await prisma.organizationMember.findFirst({ where: { userId, organizationId } });
    if (destinationMembership) {
      if (role !== undefined) await prisma.organizationMember.update({ where: { id: destinationMembership.id }, data: { role } });
      await prisma.organizationMember.deleteMany({ where: { userId, organizationId: { not: organizationId } } });
    } else {
      const currentMembership = await prisma.organizationMember.findFirst({ where: { userId }, orderBy: { createdAt: "asc" } });
      if (currentMembership) {
        await prisma.organizationMember.update({ where: { id: currentMembership.id }, data: { organizationId, ...(role !== undefined ? { role } : {}) } });
        await prisma.organizationMember.deleteMany({ where: { userId, organizationId: { not: organizationId } } });
      } else {
        await prisma.organizationMember.create({ data: { userId, organizationId, role: role ?? "USER" } });
      }
    }
  }
  if (name !== undefined || email !== undefined) {
    try {
      await prisma.user.update({ where: { id: userId }, data: { ...(name !== undefined ? { name: name.trim() } : {}), ...(email !== undefined ? { email: email.trim().toLowerCase() } : {}) } });
    } catch {
      return NextResponse.json({ error: "Email is already in use" }, { status: 409 });
    }
  }
  if (role !== undefined) {
    const membership = await prisma.organizationMember.findFirst({ where: { userId, ...(organizationId ? { organizationId } : {}) }, orderBy: { createdAt: "asc" } });
    if (!membership) return NextResponse.json({ error: "User has no organization membership" }, { status: 400 });
    await prisma.organizationMember.update({ where: { id: membership.id }, data: { role } });
  }
  if (active !== undefined) {
    await prisma.user.update({ where: { id: userId }, data: { isActive: active } });
    if (!active) await prisma.session.deleteMany({ where: { userId } });
  }
  if (passwordResetEnabled !== undefined) {
    await prisma.user.update({ where: { id: userId }, data: { passwordResetEnabled } });
    if (!passwordResetEnabled) await prisma.passwordResetToken.deleteMany({ where: { userId } });
  }
  if (organizationStatus !== undefined) {
    const membership = await prisma.organizationMember.findFirst({ where: { userId, ...(organizationId ? { organizationId } : {}) }, orderBy: { createdAt: "asc" } });
    if (!membership) return NextResponse.json({ error: "User has no organization membership" }, { status: 400 });
    const organization = await prisma.organization.findUnique({ where: { id: membership.organizationId }, select: { activatedAt: true } });
    if (!organization) return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    await prisma.organization.update({
      where: { id: membership.organizationId },
      data: {
        isActive: organizationStatus === "ACTIVE",
        activatedAt: organizationStatus === "PENDING" ? null : organization.activatedAt ?? new Date(),
      },
    });
  }
  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  const actor = await requireSuperAdmin();
  if (!actor) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const userId = request.nextUrl.searchParams.get("userId");
  if (!userId) return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  if (userId === actor.id) return NextResponse.json({ error: "You cannot delete your own account" }, { status: 400 });
  const target = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
  if (!target) return NextResponse.json({ error: "User not found" }, { status: 404 });
  if (isConfiguredSuperAdmin(target.id)) return NextResponse.json({ error: "Configured Super Admin accounts cannot be deleted here" }, { status: 403 });
  await prisma.user.delete({ where: { id: userId } });
  return NextResponse.json({ success: true });
}
