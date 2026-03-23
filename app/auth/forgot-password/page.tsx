import ForgotPasswordForm from "../components/ForgotPasswordForm";

export const metadata = {
  title: "Forgot Password | FZ Fabrics",
  description: "Reset your password",
};

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4">
      <ForgotPasswordForm />
    </div>
  );
}
