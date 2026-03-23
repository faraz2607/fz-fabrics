import { NextRequest, NextResponse } from "next/server";
import { validatePassword } from "@/lib/validation";
import { validateResetToken, resetPassword } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { token, password, confirmPassword } = await request.json();

    // Validate token
    const tokenValidation = await validateResetToken(token);
    if (!tokenValidation.valid) {
      return NextResponse.json(
        { success: false, error: tokenValidation.error },
        { status: 400 }
      );
    }

    // Validate password
    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
      return NextResponse.json(
        { success: false, errors: passwordErrors },
        { status: 400 }
      );
    }

    // Validate password confirmation
    if (!confirmPassword || confirmPassword === "") {
      return NextResponse.json(
        {
          success: false,
          errors: [
            { field: "confirmPassword", message: "Please confirm your password" },
          ],
        },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        {
          success: false,
          errors: [
            { field: "confirmPassword", message: "Passwords do not match" },
          ],
        },
        { status: 400 }
      );
    }

    // Reset password
    const result = await resetPassword(token, password);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Password reset successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
