import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id: employeeId } = await context.params;
  try {
    const { searchParams } = new URL(req.url);
    const start = searchParams.get("start");
    const end = searchParams.get("end");

    const whereClause: any = { employeeId };

    if (start && end) {
      whereClause.createdAt = {
        gte: new Date(start),
        lte: new Date(end),
      };
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
  const { id: employeeId } = await context.params;
  try {
    const { amount, totalEarning, donation, note } = await req.json();

    if (!amount || Number(amount) <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const donationAmount = parseFloat(donation ?? 0);
    const earningAfterDonation = parseFloat(totalEarning ?? 0) - donationAmount;
    const balanceAmount = earningAfterDonation - parseFloat(amount);

    const payment = await prisma.payment.create({
      data: {
        employeeId,
        amount: parseFloat(amount),
        totalEarning: parseFloat(totalEarning ?? 0),
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
