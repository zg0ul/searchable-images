import Link from "next/link";

export default function AuthSuccessPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <h1 className="text-3xl font-bold mb-4">Check your email</h1>
        <p className="text-gray-600 mb-8">
          We&apos;ve sent you a confirmation email. Please check your inbox and
          click the link to verify your account.
        </p>
        <Link
          href="/auth"
          className="text-blue-600 hover:text-blue-800 underline"
        >
          Return to login
        </Link>
      </div>
    </div>
  );
}
