import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/fabrics
export async function GET() {
  try {
    const types = await prisma.fabricType.findMany({ orderBy: { type: 'asc' } });
    return NextResponse.json(types);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch fabric types' }, { status: 500 });
  }
}

// POST /api/fabrics
export async function POST(req: NextRequest) {
  const { type, cost } = await req.json();
  const parsedCost = typeof cost === 'string' ? parseFloat(cost) : Number(cost);
  if (!type || isNaN(parsedCost) || parsedCost <= 0) {
    return NextResponse.json({ error: 'Type and cost are required and cost must be positive.' }, { status: 400 });
  }
  try {
    // Check for duplicate
    const exists = await prisma.fabricType.findUnique({ where: { type } });
    if (exists) {
      return NextResponse.json({ error: 'This fabric type already exists.' }, { status: 409 });
    }
    const fabricType = await prisma.fabricType.create({ data: { type, cost: parsedCost } });
    return NextResponse.json(fabricType, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add fabric type' }, { status: 500 });
  }
}
