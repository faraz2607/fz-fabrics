import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await import('next/headers').then(m => m.cookies());
    const sessionId = cookieStore.get("sessionId")?.value;

    if (!sessionId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { valid, userId } = await validateSession(sessionId);
    
    if (!valid || !userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const organizationId = (await prisma.organizationMember.findFirst({
      where: { userId },
      select: { organizationId: true },
    }))?.organizationId;

    const employees = await prisma.employee.findMany({
      where: {
        organizationId,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(employees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await import('next/headers').then(m => m.cookies());
    const sessionId = cookieStore.get("sessionId")?.value;

    if (!sessionId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { valid, userId } = await validateSession(sessionId);
    
    if (!valid || !userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, email, phone, donation } = body;

    // Validate required fields
    if (!name || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if employee with this email already exists
    const existingEmployee = await prisma.employee.findFirst({
      where: { email }
    });

    if (existingEmployee) {
      return NextResponse.json({ error: 'Employee with this email already exists' }, { status: 400 });
    }

    const organizationId = (await prisma.organizationMember.findFirst({
      where: { userId },
      select: { organizationId: true },
    }))?.organizationId;

    if (!organizationId) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 400 });
    }

    const employee = await prisma.employee.create({
      data: {
        name,
        email,
        phone,
        donation: donation || 0,
        organizationId,
        userId
      }
    });

    return NextResponse.json(employee, { status: 201 });
  } catch (error) {
    console.error('Error creating employee:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
