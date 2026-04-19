import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Await params to get the id
    const { id: threadId } = await params;

    // Validate threadId is provided
    if (!threadId) {
      return NextResponse.json({ error: "Thread ID is required" }, { status: 400 });
    }

    // Validate threadId is a valid ObjectId format
    if (!/^[0-9a-fA-F]{24}$/.test(threadId)) {
      return NextResponse.json({ error: "Invalid thread ID format" }, { status: 400 });
    }

    // Verify the thread belongs to the user
    const thread = await prisma.thread.findUnique({
      where: { id: threadId },
    });

    if (!thread) {
      return NextResponse.json({ error: "Thread not found" }, { status: 404 });
    }

    // Check if thread belongs to the current user
    if (thread.userId !== user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    await prisma.thread.delete({
      where: { id: threadId },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error deleting thread:", error);
    return NextResponse.json(
      { error: "Failed to delete thread" },
      { status: 500 }
    );
  }
}
