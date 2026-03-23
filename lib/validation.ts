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
