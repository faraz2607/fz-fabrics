import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { isValidAmount } from "@/lib/validation";

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
    const start = searchParams.get("start");
    const end = searchParams.get("end");

    const whereClause: { employeeId: string; organizationId: string; createdAt?: { gte: Date; lte: Date } } = {
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
      whereClause.createdAt = { gte: startDate, lte: endDate };
    }

    const payments = await prisma.payment.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(payments);
  } catch (error) {
    console.error("GET payments error:", error);
    return NextResponse.json({ error: "Failed to fetch payments" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!user.organizationId) return NextResponse.json({ error: "Organization not found" }, { status: 403 });
    const { id: employeeId } = await context.params;
    const { amount, totalEarning, donation, note } = await req.json();

    if (!isValidAmount(amount, false)) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }
    if (!isValidAmount(totalEarning ?? 0) || !isValidAmount(donation ?? 0)) {
      return NextResponse.json({ error: "Earning and donation must be valid non-negative amounts" }, { status: 400 });
    }

    const employee = await prisma.employee.findFirst({
      where: { id: employeeId, organizationId: user.organizationId },
      select: { id: true },
    });
    if (!employee) return NextResponse.json({ error: "Employee not found" }, { status: 404 });

    const donationAmount = Number(donation ?? 0);
    const earningAfterDonation = Number(totalEarning ?? 0) - donationAmount;
    const balanceAmount = earningAfterDonation - Number(amount);

    const payment = await prisma.payment.create({
      data: {
        employeeId,
        organizationId: user.organizationId,
        amount: Number(amount),
        totalEarning: Number(totalEarning ?? 0),
        donation: donationAmount,
        balance: balanceAmount,
        note: note ?? null,
      },
    });
    return NextResponse.json(payment, { status: 201 });
  } catch (error) {
    console.error("POST payments error:", error);
    return NextResponse.json({ error: "Failed to save payment" }, { status: 500 });
  }
}
