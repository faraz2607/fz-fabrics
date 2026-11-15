import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateEmail } from "@/lib/validation";

const disabledMessage = "Password reset is not enabled for this account. Please contact your administrator.";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const emailError = validateEmail(email);
    if (emailError) return NextResponse.json({ success: false, errors: [emailError] }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ success: false, error: "Invalid email address. No account was found for this email." }, { status: 404 });
    }
    if (user.isActive === false || user.passwordResetEnabled !== true) {
      return NextResponse.json({ success: false, error: disabledMessage }, { status: 403 });
    }

    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });
    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    await prisma.passwordResetToken.create({ data: { token, email: user.email, userId: user.id, expiresAt } });

    const response = NextResponse.json({ success: true, message: "Enter a new password to complete the reset." });
    response.cookies.set("passwordResetToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60,
      path: "/",
    });
    return response;
  } catch (error) {
    console.error("Password reset request failed", error);
    return NextResponse.json({ success: false, error: "Could not start the password reset. Please try again." }, { status: 500 });
  }
}
