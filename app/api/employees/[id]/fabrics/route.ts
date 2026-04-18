import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/employees/[id]/fabrics
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id: employeeId } = await context.params;
  const { type, cost, count, createdAt } = await req.json();

  if (!type || !cost || !count) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 },
    );
  }

  try {
    const parsedCost = typeof cost === 'string' ? parseFloat(cost) : Number(cost);
    const parsedCount = typeof count === 'string' ? parseInt(count) : Number(count);
    const earning = parsedCost * parsedCount;
    const fabric = await prisma.fabric.create({
      data: {
        type,
        cost: parsedCost,
        count: parsedCount,
        earning, 
        employeeId,
        createdAt: createdAt ? new Date(createdAt) : undefined,
      },
    });
    return NextResponse.json(fabric, { status: 201 });
  } catch (error) {
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
  const { id: employeeId } = await context.params;
  const { searchParams } = new URL(req.url);
  const start = searchParams.get('start');
  const end = searchParams.get('end');
  let where: any = { employeeId };
  if (start && end) {
    where.createdAt = {
      gte: new Date(start),
      lte: new Date(end),
    };
  }
  try {
    const fabrics = await prisma.fabric.findMany({
      where,
    });
    return NextResponse.json(fabrics);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch fabrics" },
      { status: 500 },
    );
  }
}
