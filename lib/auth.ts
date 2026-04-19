import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: number; // epoch milliseconds
}

export interface PasswordResetToken {
  token: string;
  email: string;
  expiresAt: number; // epoch milliseconds
}

const generateResetToken = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  const values = new Uint8Array(32);
  crypto.getRandomValues(values);
  return Array.from(values).map((b) => b.toString(16).padStart(2, "0")).join("");
};

async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createUser(
  email: string,
  name: string,
  password: string
): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { success: false, error: "User already exists with this email" };
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
      },
    });

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt.getTime(),
      },
    };
  } catch (error) {
    console.error("Error creating user:", error);
    return { success: false, error: "Failed to create user" };
  }
}

export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt.getTime(),
    };
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
}

export async function getUserById(id: string): Promise<User | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt.getTime(),
    };
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
}

export async function authenticateUser(
  email: string,
  password: string
): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    const userRecord = await prisma.user.findUnique({
      where: { email },
    });

    if (!userRecord) {
      return { success: false, error: "Invalid email or password" };
    }

    const isPasswordValid = await verifyPassword(
      password,
      userRecord.passwordHash
    );

    if (!isPasswordValid) {
      return { success: false, error: "Invalid email or password" };
    }

    return {
      success: true,
      user: {
        id: userRecord.id,
        email: userRecord.email,
        name: userRecord.name,
        createdAt: userRecord.createdAt.getTime(),
      },
    };
  } catch (error) {
    console.error("Error authenticating user:", error);
    return { success: false, error: "Authentication failed" };
  }
}

export async function createPasswordResetToken(email: string): Promise<string> {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal if email exists (security best practice)
      return generateResetToken();
    }

    // Delete any existing reset tokens for this user
    await prisma.passwordResetToken.deleteMany({
      where: { userId: user.id },
    });

    const token = generateResetToken();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

    await prisma.passwordResetToken.create({
      data: {
        token,
        email,
        userId: user.id,
        expiresAt,
      },
    });

    return token;
  } catch (error) {
    console.error("Error creating reset token:", error);
    // Return dummy token to avoid user enumeration
    return generateResetToken();
  }
}

export async function validateResetToken(token: string): Promise<{
  valid: boolean;
  email?: string;
  expiresAt?: number;
  error?: string;
}> {
  try {
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetToken) {
      return { valid: false, error: "Invalid or expired token" };
    }

    const expiresAtEpoch = resetToken.expiresAt.getTime();

    if (Date.now() > expiresAtEpoch) {
      await prisma.passwordResetToken.delete({
        where: { token },
      });
      return { valid: false, error: "Token has expired" };
    }

    return {
      valid: true,
      email: resetToken.email,
      expiresAt: expiresAtEpoch,
    };
  } catch (error) {
    console.error("Error validating reset token:", error);
    return { valid: false, error: "Invalid or expired token" };
  }
}

export async function resetPassword(
  token: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const validation = await validateResetToken(token);

    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    const email = validation.email!;
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    const newPasswordHash = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newPasswordHash },
    });

    await prisma.passwordResetToken.delete({
      where: { token },
    });

    return { success: true };
  } catch (error) {
    console.error("Error resetting password:", error);
    return { success: false, error: "Failed to reset password" };
  }
}

export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Input validation
    if (!userId || typeof userId !== 'string') {
      return { success: false, error: "Invalid user ID" };
    }

    if (!currentPassword || typeof currentPassword !== 'string') {
      return { success: false, error: "Current password is required" };
    }

    if (!newPassword || typeof newPassword !== 'string') {
      return { success: false, error: "New password is required" };
    }

    // Prevent same password
    if (currentPassword === newPassword) {
      return { success: false, error: "New password must be different from current password" };
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    // Verify current password
    const isCurrentPasswordValid = await verifyPassword(
      currentPassword,
      user.passwordHash
    );

    if (!isCurrentPasswordValid) {
      return { success: false, error: "Current password is incorrect" };
    }

    // Hash new password
    const newPasswordHash = await hashPassword(newPassword);

    // Update password in database
    await prisma.user.update({
      where: { id: userId },
      data: { 
        passwordHash: newPasswordHash,
        updatedAt: new Date()
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error changing password:", error);
    
    // Handle specific database errors
    if (error instanceof Error) {
      if (error.message.includes('User not found')) {
        return { success: false, error: "User not found" };
      }
      if (error.message.includes('connection')) {
        return { success: false, error: "Database connection error" };
      }
    }
    
    return { success: false, error: "Failed to change password" };
  }
}

// Simulate sending email (in production, use a service like SendGrid, AWS SES, etc.)
export async function sendPasswordResetEmail(
  email: string,
  token: string,
  resetUrl: string
): Promise<{ success: boolean; error?: string }> {
  // In production, integrate with email service
  console.log(`[EMAIL] Password reset link for ${email}:`);
  console.log(`${resetUrl}?token=${token}`);

  // Simulate delay
  await new Promise((resolve) => setTimeout(resolve, 100));

  return { success: true };
}

