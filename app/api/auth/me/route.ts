import { NextRequest, NextResponse } from "next/server";
import { isConfiguredSuperAdmin, validateSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.cookies.get("sessionId")?.value;

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Validate session
    const sessionResult = await validateSession(sessionId);
    if (!sessionResult.valid || !sessionResult.userId) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired session" },
        { status: 401 }
      );
    }

    // Get user data from database
    try {
      const user = await prisma.user.findUnique({
        where: { id: sessionResult.userId },
        select: {
          id: true,
          email: true,
          name: true,
          isActive: true,
        },
      });

      if (!user || user.isActive === false) {
        return NextResponse.json(
          { success: false, error: "User not found" },
          { status: 404 }
        );
      }

      const membership = await prisma.organizationMember.findFirst({
        where: { userId: user.id },
        include: { organization: true },
        orderBy: { createdAt: "asc" },
      });

      return NextResponse.json(
        {
          success: true,
          user: {
            ...user,
            organizationId: membership?.organizationId,
            organizationName: membership?.organization?.name,
            organizationInviteCode: membership?.role === "ADMIN" ? membership.organization?.inviteCode : undefined,
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
          },
        },
        { status: 200 }
      );
    } catch (dbError) {
      console.error("Database error:", dbError);
      // Return a generic response even if database fails
      return NextResponse.json(
        { success: true, user: { id: sessionResult.userId, name: "User", email: "" } },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error("Auth error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
