import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { isValidAmount, isValidPositiveInteger } from "@/lib/validation";

// POST /api/employees/[id]/fabrics
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!user.organizationId) return NextResponse.json({ error: "Organization not found" }, { status: 403 });
    const { id: employeeId } = await context.params;
    const { type, cost, count, createdAt } = await req.json();
    if (typeof type !== "string" || !type.trim() || !isValidAmount(cost, false) || !isValidPositiveInteger(count)) {
      return NextResponse.json({ error: "Fabric type, positive cost, and positive count are required" }, { status: 400 });
    }

    const employee = await prisma.employee.findFirst({
      where: { id: employeeId, organizationId: user.organizationId },
      select: { id: true },
    });
    if (!employee) return NextResponse.json({ error: "Employee not found" }, { status: 404 });

    const fabricType = await prisma.fabricType.findFirst({
      where: { type: type.trim(), organizationId: user.organizationId },
      select: { type: true },
    });
    if (!fabricType) return NextResponse.json({ error: "Fabric type not found in this organization" }, { status: 400 });

    const parsedCost = Number(cost);
    const parsedCount = Number(count);
    const date = createdAt ? new Date(createdAt) : undefined;
    if (date && Number.isNaN(date.getTime())) {
      return NextResponse.json({ error: "Invalid fabric date" }, { status: 400 });
    }
    const fabric = await prisma.fabric.create({
      data: {
        type: fabricType.type,
        cost: parsedCost,
        count: parsedCount,
        earning: parsedCost * parsedCount,
        employeeId,
        organizationId: user.organizationId,
        createdAt: date,
      },
    });
    return NextResponse.json(fabric, { status: 201 });
  } catch (error) {
    console.error("Failed to add fabric:", error);
    return NextResponse.json(
      { error: "Failed to add fabric" },
      { status: 500 },
    );
  }
}

// GET /api/employees/[id]/fabrics
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!user.organizationId) return NextResponse.json({ error: "Organization not found" }, { status: 403 });
    const { id: employeeId } = await context.params;
    const { searchParams } = new URL(req.url);
    const start = searchParams.get('start');
    const end = searchParams.get('end');
    const where: { employeeId: string; organizationId: string; createdAt?: { gte: Date; lte: Date } } = {
      employeeId,
      organizationId: user.organizationId,
    };
    const employee = await prisma.employee.findFirst({
      where: { id: employeeId, organizationId: user.organizationId },
      select: { id: true },
    });
    if (!employee) return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    if (start && end) {
      const startDate = new Date(start);
      const endDate = new Date(end);
      if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
        return NextResponse.json({ error: "Invalid date range" }, { status: 400 });
      }
      where.createdAt = { gte: startDate, lte: endDate };
    }
    const fabrics = await prisma.fabric.findMany({
      where,
    });
    return NextResponse.json(fabrics);
  } catch (error) {
    console.error("Failed to fetch employee fabrics:", error);
    return NextResponse.json(
      { error: "Failed to fetch fabrics" },
      { status: 500 },
    );
  }
}
