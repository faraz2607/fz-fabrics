import { prisma } from "./prisma";
import { cookies } from "next/headers";

export async function createSession(userId: string): Promise<string> {
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24 hours

  try {
    const session = await prisma.session.create({
      data: {
        userId,
        expiresAt,
      },
    });

    return session.id;
  } catch (error) {
    console.error("Error creating session:", error);
    throw error;
  }
}

export async function validateSession(sessionId: string): Promise<{
  valid: boolean;
  userId?: string;
  organizationActive?: boolean;
  organizationStatus?: "PENDING" | "ACTIVE" | "INACTIVE";
}> {
  try {
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      return { valid: false };
    }

    if (new Date() > session.expiresAt) {
      await prisma.session.delete({
        where: { id: sessionId },
      });
      return { valid: false };
    }

    const account = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { isActive: true },
    });
    if (!account || account.isActive === false) {
      await prisma.session.delete({ where: { id: sessionId } });
      return { valid: false };
    }

    // Super Admin access is platform-wide and must not depend on organization status.
    if (isConfiguredSuperAdmin(session.userId)) {
      return { valid: true, userId: session.userId, organizationActive: true };
    }

    const membership = await prisma.organizationMember.findFirst({
      where: { userId: session.userId },
      orderBy: { createdAt: "asc" },
      select: { organization: { select: { isActive: true } } },
    });
    const organizationActive = Boolean(membership) && membership?.organization?.isActive !== false;
    return { valid: true, userId: session.userId, organizationActive };
  } catch (error) {
    console.error("Error validating session:", error);
    return { valid: false };
  }
}

export async function destroySession(sessionId: string): Promise<void> {
  try {
    await prisma.session.delete({
      where: { id: sessionId },
    });
  } catch (error) {
    console.error("Error destroying session:", error);
  }
}

export async function getSessionUser(): Promise<{ id: string; name: string; email: string; organizationId?: string; organizationName?: string; organizationActive?: boolean; organizationStatus?: "PENDING" | "ACTIVE" | "INACTIVE"; role?: string; organizationInviteCode?: string } | null> {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("sessionId")?.value;

    if (!sessionId) {
      return null;
    }

    const { valid, userId } = await validateSession(sessionId);

    if (!valid || !userId) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, isActive: true },
    });

    if (!user || user.isActive === false) {
      return null;
    }

    const membership = await prisma.organizationMember.findFirst({
      where: { userId },
      include: { organization: true },
      orderBy: { createdAt: "asc" },
    });

    return {
      ...user,
      organizationId: membership?.organizationId,
      organizationName: membership?.organization?.name,
      organizationActive: isConfiguredSuperAdmin(user.id) || (Boolean(membership) && membership?.organization?.isActive !== false),
      organizationStatus: isConfiguredSuperAdmin(user.id)
        ? "ACTIVE"
        : !membership
          ? "PENDING"
          : membership.organization?.isActive !== false
          ? "ACTIVE"
          : membership?.organization?.activatedAt
            ? "INACTIVE"
            : "PENDING",
      role: isConfiguredSuperAdmin(user.id) ? "SUPER_ADMIN" : membership?.role,
      organizationInviteCode: membership?.organization?.inviteCode,
    };
  } catch (error) {
    console.error("Error getting session user:", error);
    return null;
  }
}

export function isConfiguredSuperAdmin(userId: string): boolean {
  const ids = (process.env.SUPER_ADMIN_USER_IDS || "").split(",").map((value) => value.trim()).filter(Boolean);
  return ids.length <= 3 && ids.includes(userId);
}

