import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/session';
import { isValidAmount } from '@/lib/validation';

// GET /api/fabrics
export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!user.organizationId) return NextResponse.json({ error: 'Organization not found' }, { status: 403 });
    const types = await prisma.fabricType.findMany({
      where: { organizationId: user.organizationId },
      orderBy: { type: 'asc' },
    });
    return NextResponse.json(types);
  } catch (error) {
    console.error('Failed to fetch fabric types:', error);
    return NextResponse.json({ error: 'Failed to fetch fabric types' }, { status: 500 });
  }
}

// POST /api/fabrics
export async function POST(req: NextRequest) {
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
    // Check for duplicate
    const exists = await prisma.fabricType.findFirst({
      where: { organizationId: user.organizationId, type },
    });
    if (exists) {
      return NextResponse.json({ error: 'This fabric type already exists.' }, { status: 409 });
    }
    const fabricType = await prisma.fabricType.create({
      data: { type, cost: Number(body.cost), organizationId: user.organizationId },
    });
    return NextResponse.json(fabricType, { status: 201 });
  } catch (error) {
    console.error('Failed to add fabric type:', error);
    return NextResponse.json({ error: 'Failed to add fabric type' }, { status: 500 });
  }
}
