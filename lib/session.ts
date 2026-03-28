import { prisma } from "./prisma";
import { cookies } from "next/headers";

export async function createSession(userId: string): Promise<string> {
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24 hours

  try {
    const session = await prisma.session.create({
      data: {
        userId,
        expiresAt,
      },
    });

    return session.id;
  } catch (error) {
    console.error("Error creating session:", error);
    throw error;
  }
}

export async function validateSession(sessionId: string): Promise<{
  valid: boolean;
  userId?: string;
}> {
  try {
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      return { valid: false };
    }

    if (new Date() > session.expiresAt) {
      await prisma.session.delete({
        where: { id: sessionId },
      });
      return { valid: false };
    }

    return { valid: true, userId: session.userId };
  } catch (error) {
    console.error("Error validating session:", error);
    return { valid: false };
  }
}

export async function destroySession(sessionId: string): Promise<void> {
  try {
    await prisma.session.delete({
      where: { id: sessionId },
    });
  } catch (error) {
    console.error("Error destroying session:", error);
  }
}

export async function getSessionUser(): Promise<{ id: string; name: string; email: string } | null> {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("sessionId")?.value;

    if (!sessionId) {
      return null;
    }

    const { valid, userId } = await validateSession(sessionId);

    if (!valid || !userId) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true },
    });

    return user;
  } catch (error) {
    console.error("Error getting session user:", error);
    return null;
  }
}

