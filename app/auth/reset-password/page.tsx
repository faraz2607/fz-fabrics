import ResetPasswordForm from "../components/ResetPasswordForm";

export const metadata = {
  title: "Reset Password | FZ Fabrics",
  description: "Set your new password",
};

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4">
      <ResetPasswordForm />
    </div>
  );
}
