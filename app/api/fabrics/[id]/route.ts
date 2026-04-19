import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PUT /api/fabrics/[id]
export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { type, cost } = await req.json();
  const parsedCost = typeof cost === 'string' ? parseFloat(cost) : Number(cost);
  if (!type || isNaN(parsedCost) || parsedCost <= 0) {
    return NextResponse.json({ error: 'Type and cost are required and cost must be positive.' }, { status: 400 });
  }
  try {
    const { id } = await context.params;
    // Get current fabric type
    const current = await prisma.fabricType.findUnique({ where: { id } });
    if (!current) {
      return NextResponse.json({ error: 'Fabric type not found.' }, { status: 404 });
    }
    // Only check for duplicate if type is being changed
    if (type !== current.type) {
      const exists = await prisma.fabricType.findUnique({ where: { type } });
      if (exists) {
        return NextResponse.json({ error: 'This fabric type already exists.' }, { status: 409 });
      }
    }
    const updated = await prisma.fabricType.update({
      where: { id },
      data: { type, cost: parsedCost },
    });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update fabric type' }, { status: 500 });
  }
}

// DELETE /api/fabrics/[id]
export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    await prisma.fabricType.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete fabric type' }, { status: 500 });
  }
}
