import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    // Await the params to get the actual id
    const { id } = await params;

    const employee = await prisma.employee.findUnique({
      where: {
        id,
        userId
      }
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

    // Await the params to get the actual id
    const { id } = await params;

    // Check if employee exists and belongs to the user
    const existingEmployee = await prisma.employee.findUnique({
      where: {
        id,
        userId
      }
    });

    if (!existingEmployee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    // Check if email is already taken by another employee
    const emailExists = await prisma.employee.findFirst({
      where: {
        email,
        id: { not: id },
        userId
      }
    });

    if (emailExists) {
      return NextResponse.json({ error: 'Employee with this email already exists' }, { status: 400 });
    }

    const updatedEmployee = await prisma.employee.update({
      where: {
        id,
        userId
      },
      data: {
        name,
        email,
        phone,
        donation: donation !== undefined ? donation : existingEmployee.donation
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
    const cookieStore = await import('next/headers').then(m => m.cookies());
    const sessionId = cookieStore.get("sessionId")?.value;

    if (!sessionId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { valid, userId } = await validateSession(sessionId);
    
    if (!valid || !userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Await the params to get the actual id
    const { id } = await params;

    // Check if employee exists and belongs to the user
    const existingEmployee = await prisma.employee.findUnique({
      where: {
        id,
        userId
      }
    });

    if (!existingEmployee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    await prisma.employee.delete({
      where: {
        id,
        userId
      }
    });

    return NextResponse.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    console.error('Error deleting employee:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
