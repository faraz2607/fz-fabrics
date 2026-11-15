import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const start = searchParams.get("start");
  const end = searchParams.get("end");
  const employeeId = searchParams.get("employeeId");

  try {
    const sessionId = req.cookies.get("sessionId")?.value;
    if (!sessionId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { validateSession } = await import("@/lib/session");
    const session = await validateSession(sessionId);
    if (!session.valid || !session.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const membership = await prisma.organizationMember.findFirst({
      where: { userId: session.userId },
      select: { organizationId: true },
    });

    const where: any = { organizationId: membership?.organizationId };
    if (start && end) {
      where.createdAt = { gte: new Date(start), lte: new Date(end) };
    }
    if (employeeId) {
      where.employeeId = employeeId;
    }

    const grouped = await prisma.fabric.groupBy({
      by: ["type"],
      where,
      _sum: { count: true },
      orderBy: { type: "asc" },
    });

    return NextResponse.json(
      grouped.map((g) => ({ type: g.type, count: g._sum.count ?? 0 }))
    );
  } catch {
    return NextResponse.json({ error: "Failed to fetch fabric counts" }, { status: 500 });
  }
}
