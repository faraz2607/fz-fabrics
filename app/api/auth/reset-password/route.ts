import { NextRequest, NextResponse } from "next/server";
import { resetPassword, validateResetToken } from "@/lib/auth";
import { validatePassword } from "@/lib/validation";

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("passwordResetToken")?.value;
    if (!token) return NextResponse.json({ success: false, error: "Your reset request has expired. Please enter your email again." }, { status: 401 });

    const { password, confirmPassword } = await request.json();
    const tokenValidation = await validateResetToken(token);
    if (!tokenValidation.valid) {
      const response = NextResponse.json({ success: false, error: tokenValidation.error || "Your reset request has expired." }, { status: 400 });
      response.cookies.delete("passwordResetToken");
      return response;
    }

    const passwordErrors = typeof password === "string"
      ? validatePassword(password)
      : [{ field: "password", message: "Password is required" }];
    if (passwordErrors.length > 0) return NextResponse.json({ success: false, errors: passwordErrors }, { status: 400 });
    if (typeof confirmPassword !== "string" || !confirmPassword || confirmPassword !== password) {
      return NextResponse.json({ success: false, errors: [{ field: "confirmPassword", message: confirmPassword ? "Passwords do not match" : "Please confirm your password" }] }, { status: 400 });
    }

    const result = await resetPassword(token, password);
    if (!result.success) return NextResponse.json({ success: false, error: result.error }, { status: 400 });

    const response = NextResponse.json({ success: true, message: "Your password has been reset successfully." });
    response.cookies.delete("passwordResetToken");
    return response;
  } catch (error) {
    console.error("Password reset failed", error);
    return NextResponse.json({ success: false, error: "Could not reset your password. Please try again." }, { status: 500 });
  }
}
