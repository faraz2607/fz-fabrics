import { NextRequest, NextResponse } from "next/server";
import { validateEmail } from "@/lib/validation";
import { createPasswordResetToken, sendPasswordResetEmail } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    // Validate email
    const emailError = validateEmail(email);
    if (emailError) {
      return NextResponse.json(
        { success: false, errors: [emailError] },
        { status: 400 }
      );
    }

    // Create reset token
    const token = await createPasswordResetToken(email);

    // Send reset email
    const resetUrl = new URL("/auth/reset-password", request.url).toString();
    await sendPasswordResetEmail(email, token, resetUrl);

    // Always return success (don't reveal if email exists)
    return NextResponse.json(
      {
        success: true,
        message: "If an account exists with this email, you will receive a password reset link",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
