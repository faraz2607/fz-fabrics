import { NextRequest, NextResponse } from "next/server";
import { validateSignupForm } from "@/lib/validation";
import { createUser } from "@/lib/auth";
import { createSession } from "@/lib/session";

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, confirmPassword } = await request.json();

    // Validate form
    const validationErrors = validateSignupForm(
      name,
      email,
      password,
      confirmPassword
    );
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { success: false, errors: validationErrors },
        { status: 400 }
      );
    }

    // Create user
    const result = await createUser(email, name, password);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    // Create session
    const sessionId = await createSession(result.user!.id);

    // Set session cookie
    const response = NextResponse.json(
      {
        success: true,
        user: {
          id: result.user!.id,
          email: result.user!.email,
          name: result.user!.name,
        },
      },
      { status: 201 }
    );

    response.cookies.set("sessionId", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return response;
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
