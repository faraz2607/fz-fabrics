import LoginForm from "../components/LoginForm";

export const metadata = {
  title: "Login | FZ Fabrics",
  description: "Login to your account",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center py-12 px-4">
      <LoginForm />
    </div>
  );
}
