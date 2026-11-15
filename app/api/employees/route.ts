import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { isValidAmount, isValidPhoneNumber } from '@/lib/validation';

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!user.organizationId) return NextResponse.json({ error: 'Organization not found' }, { status: 403 });

    const employees = await prisma.employee.findMany({
      where: { organizationId: user.organizationId },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(employees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!user.organizationId) return NextResponse.json({ error: 'Organization not found' }, { status: 403 });

    const body = await request.json();
    const { name, email, phone, donation } = body;

    if (typeof name !== 'string' || !name.trim() || typeof email !== 'string' || !email.trim()) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    if (!isValidPhoneNumber(phone)) {
      return NextResponse.json({ error: 'Phone number must contain exactly 10 digits' }, { status: 400 });
    }
    const donationAmount = donation === undefined || donation === null || donation === '' ? 0 : donation;
    if (!isValidAmount(donationAmount)) {
      return NextResponse.json({ error: 'Donation must be a non-negative amount with up to 2 decimal places' }, { status: 400 });
    }

    const existingEmployee = await prisma.employee.findFirst({
      where: { email: email.trim(), organizationId: user.organizationId }
    });

    if (existingEmployee) {
      return NextResponse.json({ error: 'Employee with this email already exists' }, { status: 400 });
    }

    const employee = await prisma.employee.create({
      data: {
        name: name.trim(),
        email: email.trim(),
        phone: phone || null,
        donation: Number(donationAmount),
        organizationId: user.organizationId,
        userId: user.id
      }
    });

    return NextResponse.json(employee, { status: 201 });
  } catch (error) {
    console.error('Error creating employee:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
