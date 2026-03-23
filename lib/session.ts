import { prisma } from "./prisma";

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

