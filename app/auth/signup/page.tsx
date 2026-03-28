import SignupForm from "../components/SignupForm";

export const metadata = {
  title: "Sign Up | FZ Fabrics",
  description: "Create a new account",
};

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center py-12 px-4">
      <SignupForm />
    </div>
  );
}
