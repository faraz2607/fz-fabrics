import { redirect } from "next/navigation";

export const metadata = {
  title: "Reset Password",
  description: "Recover access to your FabriTrack account.",
};

export default function ForgotPasswordPage() {
  redirect("/auth/reset-password");
}
