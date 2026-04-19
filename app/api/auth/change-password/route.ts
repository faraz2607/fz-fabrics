import { NextRequest, NextResponse } from "next/server";
import { changePassword } from "@/lib/auth";
import { validateChangePassword } from "@/lib/validation";
import { getSessionUser } from "@/lib/session";

export async function POST(request: NextRequest) {
  try {
    // Get current user from session
    const user = await getSessionUser();
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in to change your password." },
        { status: 401 }
      );
    }

    // Parse and validate request body
    let body;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid request format. Please provide valid JSON." },
        { status: 400 }
      );
    }

    const { currentPassword, newPassword, confirmPassword } = body;

    // Check if all required fields are provided
    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { error: "All fields are required: current password, new password, and confirm password." },
        { status: 400 }
      );
    }

    // Validate input types
    if (typeof currentPassword !== 'string' || typeof newPassword !== 'string' || typeof confirmPassword !== 'string') {
      return NextResponse.json(
        { error: "All password fields must be strings." },
        { status: 400 }
      );
    }

    // Validate password requirements
    const validationErrors = validateChangePassword(
      currentPassword,
      newPassword,
      confirmPassword
    );

    if (validationErrors.length > 0) {
      return NextResponse.json(
        { 
          error: "Validation failed. Please check your input.",
          errors: validationErrors 
        },
        { status: 400 }
      );
    }

    // Attempt to change password
    const result = await changePassword(user.id, currentPassword, newPassword);

    if (!result.success) {
      // Handle specific error cases
      if (result.error === "Current password is incorrect") {
        return NextResponse.json(
          { error: "Current password is incorrect. Please try again." },
          { status: 400 }
        );
      }
      
      if (result.error === "User not found") {
        return NextResponse.json(
          { error: "User account not found. Please log in again." },
          { status: 404 }
        );
      }

      // Generic error for other cases
      return NextResponse.json(
        { error: result.error || "Failed to change password. Please try again later." },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      message: "Password changed successfully. Your account is now more secure." 
    });
    
  } catch (error) {
    console.error("Change password API error:", error);
    
    // Handle different types of errors
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Invalid request format. Please check your input." },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again later." },
      { status: 500 }
    );
  }
}