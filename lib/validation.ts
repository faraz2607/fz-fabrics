// Email validation regex
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Password requirements
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_REQUIRES_UPPERCASE = true;
export const PASSWORD_REQUIRES_NUMBER = true;
export const PASSWORD_REQUIRES_SPECIAL = true;

export interface ValidationError {
  field: string;
  message: string;
}

export function validateEmail(email: string): ValidationError | null {
  if (!email || email.trim() === "") {
    return { field: "email", message: "Email is required" };
  }
  if (!EMAIL_REGEX.test(email)) {
    return { field: "email", message: "Invalid email format" };
  }
  return null;
}

export function validatePassword(password: string): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!password || password === "") {
    errors.push({ field: "password", message: "Password is required" });
    return errors;
  }

  if (password.length < PASSWORD_MIN_LENGTH) {
    errors.push({
      field: "password",
      message: `Password must be at least ${PASSWORD_MIN_LENGTH} characters`,
    });
  }

  if (PASSWORD_REQUIRES_UPPERCASE && !/[A-Z]/.test(password)) {
    errors.push({
      field: "password",
      message: "Password must contain an uppercase letter",
    });
  }

  if (PASSWORD_REQUIRES_NUMBER && !/[0-9]/.test(password)) {
    errors.push({
      field: "password",
      message: "Password must contain a number",
    });
  }

  if (PASSWORD_REQUIRES_SPECIAL && !/[!@#$%^&*]/.test(password)) {
    errors.push({
      field: "password",
      message: "Password must contain a special character (!@#$%^&*)",
    });
  }

  return errors;
}

export function validateName(name: string): ValidationError | null {
  if (!name || name.trim() === "") {
    return { field: "name", message: "Name is required" };
  }
  if (name.trim().length < 2) {
    return { field: "name", message: "Name must be at least 2 characters" };
  }
  return null;
}

export function validateLoginForm(email: string, password: string) {
  const errors: ValidationError[] = [];

  const emailError = validateEmail(email);
  if (emailError) errors.push(emailError);

  if (!password || password === "") {
    errors.push({ field: "password", message: "Password is required" });
  }

  return errors;
}

export function validateSignupForm(
  name: string,
  email: string,
  password: string,
  confirmPassword: string
) {
  const errors: ValidationError[] = [];

  const nameError = validateName(name);
  if (nameError) errors.push(nameError);

  const emailError = validateEmail(email);
  if (emailError) errors.push(emailError);

  const passwordErrors = validatePassword(password);
  errors.push(...passwordErrors);

  if (!confirmPassword || confirmPassword === "") {
    errors.push({
      field: "confirmPassword",
      message: "Please confirm your password",
    });
  } else if (password !== confirmPassword) {
    errors.push({
      field: "confirmPassword",
      message: "Passwords do not match",
    });
  }

  return errors;
}

export function validateChangePassword(
  currentPassword: string,
  newPassword: string,
  confirmPassword: string
) {
  const errors: ValidationError[] = [];

  // Validate input types
  if (typeof currentPassword !== 'string' || typeof newPassword !== 'string' || typeof confirmPassword !== 'string') {
    errors.push({
      field: "general",
      message: "All password fields must be valid strings",
    });
    return errors;
  }

  // Current password validation
  if (!currentPassword || currentPassword.trim() === "") {
    errors.push({
      field: "currentPassword",
      message: "Current password is required",
    });
  } else if (currentPassword.length > 128) {
    errors.push({
      field: "currentPassword",
      message: "Current password is too long",
    });
  }

  // New password validation
  if (!newPassword || newPassword.trim() === "") {
    errors.push({
      field: "newPassword",
      message: "New password is required",
    });
  } else {
    // Check for spaces
    if (newPassword.includes(' ')) {
      errors.push({
        field: "newPassword",
        message: "Password cannot contain spaces",
      });
    }
    
    // Length validation
    if (newPassword.length < PASSWORD_MIN_LENGTH) {
      errors.push({
        field: "newPassword",
        message: `Password must be at least ${PASSWORD_MIN_LENGTH} characters long`,
      });
    }
    
    if (newPassword.length > 128) {
      errors.push({
        field: "newPassword",
        message: "Password must be less than 128 characters",
      });
    }

    // Character requirements
    if (PASSWORD_REQUIRES_UPPERCASE && !/[A-Z]/.test(newPassword)) {
      errors.push({
        field: "newPassword",
        message: "Password must contain at least one uppercase letter",
      });
    }

    if (PASSWORD_REQUIRES_NUMBER && !/[0-9]/.test(newPassword)) {
      errors.push({
        field: "newPassword",
        message: "Password must contain at least one number",
      });
    }

    if (PASSWORD_REQUIRES_SPECIAL && !/[!@#$%^&*]/.test(newPassword)) {
      errors.push({
        field: "newPassword",
        message: "Password must contain at least one special character (!@#$%^&*)",
      });
    }
  }

  // Confirm password validation
  if (!confirmPassword || confirmPassword.trim() === "") {
    errors.push({
      field: "confirmPassword",
      message: "Please confirm your new password",
    });
  } else if (confirmPassword.length > 128) {
    errors.push({
      field: "confirmPassword",
      message: "Confirm password is too long",
    });
  } else if (newPassword !== confirmPassword) {
    errors.push({
      field: "confirmPassword",
      message: "Passwords do not match",
    });
  }

  // Check if new password is same as current (only if both are provided and valid)
  if (currentPassword && newPassword && currentPassword.trim() !== "" && newPassword.trim() !== "" && 
      currentPassword === newPassword) {
    errors.push({
      field: "newPassword",
      message: "New password must be different from current password",
    });
  }

  return errors;
}
