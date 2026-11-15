import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";
import { isValidAmount } from "@/lib/validation";

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!user.organizationId) {
      return NextResponse.json({ error: "Organization not found" }, { status: 403 });
    }

    const body = await request.json();
    const { type, color, cost, date } = body;

    if (!type || !color || cost === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (typeof type !== "string" || typeof color !== "string" || !isValidAmount(cost, false)) {
      return NextResponse.json({ error: "Thread type, color, and a positive cost are required" }, { status: 400 });
    }

    const thread = await prisma.thread.create({
      data: {
        organizationId: user.organizationId,
        userId: user.id,
        type,
        color,
        cost: Number(cost),
        date: date ? new Date(date) : new Date(),
      },
    });

    return NextResponse.json(thread, { status: 201 });
  } catch (error) {
    console.error("Error creating thread:", error);
    return NextResponse.json(
      { error: "Failed to create thread" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!user.organizationId) {
      return NextResponse.json({ error: "Organization not found" }, { status: 403 });
    }

    const threads = await prisma.thread.findMany({
      where: {
        organizationId: user.organizationId,
      },
      orderBy: {
        date: "asc",
      },
    });

    return NextResponse.json(threads, { status: 200 });
  } catch (error) {
    console.error("Error fetching threads:", error);
    return NextResponse.json(
      { error: "Failed to fetch threads" },
      { status: 500 }
    );
  }
}
