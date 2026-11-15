import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { isValidAmount, isValidPhoneNumber } from '@/lib/validation';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!user.organizationId) return NextResponse.json({ error: 'Organization not found' }, { status: 403 });
    const { id } = await params;

    const employee = await prisma.employee.findFirst({
      where: { id, organizationId: user.organizationId }
    });

    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    return NextResponse.json(employee);
  } catch (error) {
    console.error('Error fetching employee:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const actor = await getSessionUser();
    if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (actor.role !== 'ADMIN' && actor.role !== 'SUPER_ADMIN') return NextResponse.json({ error: 'Only admins can edit employees' }, { status: 403 });
    if (!actor.organizationId) return NextResponse.json({ error: 'Organization not found' }, { status: 403 });

    const body = await request.json();
    const { name, email, phone, donation } = body;

    if (typeof name !== 'string' || !name.trim() || typeof email !== 'string' || !email.trim()) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    if (!isValidPhoneNumber(phone)) {
      return NextResponse.json({ error: 'Phone number must contain exactly 10 digits' }, { status: 400 });
    }
    const { id } = await params;

    const existingEmployee = await prisma.employee.findFirst({
      where: { id, organizationId: actor.organizationId }
    });

    if (!existingEmployee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }
    const donationAmount = donation === undefined || donation === null || donation === ''
      ? existingEmployee.donation
      : donation;
    if (!isValidAmount(donationAmount)) {
      return NextResponse.json({ error: 'Donation must be a non-negative amount with up to 2 decimal places' }, { status: 400 });
    }

    // Check if email is already taken by another employee
    const emailExists = await prisma.employee.findFirst({
      where: {
        email: email.trim(),
        id: { not: id },
        organizationId: actor.organizationId,
      }
    });

    if (emailExists) {
      return NextResponse.json({ error: 'Employee with this email already exists' }, { status: 400 });
    }

    const updatedEmployee = await prisma.employee.update({
      where: {
        id,
      },
      data: {
        name: name.trim(),
        email: email.trim(),
        phone: phone || null,
        donation: Number(donationAmount)
      }
    });

    return NextResponse.json(updatedEmployee);
  } catch (error) {
    console.error('Error updating employee:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const actor = await getSessionUser();
    if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (actor.role !== 'ADMIN' && actor.role !== 'SUPER_ADMIN') return NextResponse.json({ error: 'Only admins can delete employees' }, { status: 403 });
    if (!actor.organizationId) return NextResponse.json({ error: 'Organization not found' }, { status: 403 });
    const { id } = await params;

    const existingEmployee = await prisma.employee.findFirst({
      where: { id, organizationId: actor.organizationId }
    });

    if (!existingEmployee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    await prisma.employee.delete({
      where: {
        id,
      }
    });

    return NextResponse.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    console.error('Error deleting employee:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
