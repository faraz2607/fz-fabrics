import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/session';
import { isValidAmount } from '@/lib/validation';

// PUT /api/fabrics/[id]
export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!user.organizationId) return NextResponse.json({ error: 'Organization not found' }, { status: 403 });
  let body: { type?: unknown; cost?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
  const type = typeof body.type === 'string' ? body.type.trim() : '';
  if (!type || !isValidAmount(body.cost, false)) {
    return NextResponse.json({ error: 'Type and cost are required and cost must be positive.' }, { status: 400 });
  }
  try {
    const { id } = await context.params;
    const current = await prisma.fabricType.findFirst({
      where: { id, organizationId: user.organizationId },
    });
    if (!current) {
      return NextResponse.json({ error: 'Fabric type not found.' }, { status: 404 });
    }
    if (type !== current.type) {
      const exists = await prisma.fabricType.findFirst({
        where: { organizationId: user.organizationId, type },
      });
      if (exists) {
        return NextResponse.json({ error: 'This fabric type already exists.' }, { status: 409 });
      }
    }
    const updated = await prisma.fabricType.update({
      where: { id },
      data: { type, cost: Number(body.cost) },
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Failed to update fabric type:', error);
    return NextResponse.json({ error: 'Failed to update fabric type' }, { status: 500 });
  }
}

// DELETE /api/fabrics/[id]
export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!user.organizationId) return NextResponse.json({ error: 'Organization not found' }, { status: 403 });
  try {
    const { id } = await context.params;
    const existing = await prisma.fabricType.findFirst({
      where: { id, organizationId: user.organizationId },
      select: { id: true },
    });
    if (!existing) return NextResponse.json({ error: 'Fabric type not found.' }, { status: 404 });
    await prisma.fabricType.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete fabric type:', error);
    return NextResponse.json({ error: 'Failed to delete fabric type' }, { status: 500 });
  }
}
