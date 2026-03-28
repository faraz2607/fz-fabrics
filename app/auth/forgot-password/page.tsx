import ForgotPasswordForm from "../components/ForgotPasswordForm";

export const metadata = {
  title: "Forgot Password | FZ Fabrics",
  description: "Reset your password",
};

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center py-12 px-4">
      <ForgotPasswordForm />
    </div>
  );
}
