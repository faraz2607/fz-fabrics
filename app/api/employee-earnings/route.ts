import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const start = searchParams.get("start");
  const end = searchParams.get("end");

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

    const grouped = await prisma.fabric.groupBy({
      by: ["employeeId"],
      where,
      _sum: { earning: true, count: true },
    });

    const employees = await prisma.employee.findMany({
      where: { id: { in: grouped.map((g) => g.employeeId) } },
      select: { id: true, name: true },
    });

    const nameMap = Object.fromEntries(employees.map((e) => [e.id, e.name]));

    const result = grouped.map((g) => ({
      employeeId: g.employeeId,
      employeeName: nameMap[g.employeeId] ?? "Unknown",
      earning: g._sum.earning ?? 0,
      count: g._sum.count ?? 0,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Employee earnings error:", error);
    return NextResponse.json({ error: "Failed to fetch employee earnings" }, { status: 500 });
  }
}
