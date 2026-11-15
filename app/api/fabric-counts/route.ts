import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const start = searchParams.get("start");
  const end = searchParams.get("end");
  const employeeId = searchParams.get("employeeId");

  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!user.organizationId) return NextResponse.json({ error: "Organization not found" }, { status: 403 });

    const where: { organizationId: string; createdAt?: { gte: Date; lte: Date }; employeeId?: string } = {
      organizationId: user.organizationId,
    };
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
  } catch (error) {
    console.error("Fabric counts error:", error);
    return NextResponse.json({ error: "Failed to fetch fabric counts" }, { status: 500 });
  }
}
