"use client";

import { useState } from "react";
import Link from "next/link";
import { login, signup } from "./actions";
import { toast, Toaster } from "sonner";

// Reusable loading spinner component
const LoadingSpinner = () => (
  <svg
    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

// Reusable form input component
const FormInput = ({
  id,
  type,
  label,
  placeholder,
  disabled,
}: {
  id: string;
  type: string;
  label: string;
  placeholder: string;
  disabled: boolean;
}) => (
  <div>
    <label
      htmlFor={id}
      className="block text-md font-bold text-emerald-500 mb-1"
    >
      {label}
    </label>
    <input
      id={id}
      name={id}
      type={type}
      required
      className="w-full p-2 border-2 border-gray-400 bg-gray-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
      disabled={disabled}
      placeholder={placeholder}
    />
  </div>
);

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Handle form submission
  const handleAction = async (
    formData: FormData,
    action: typeof login | typeof signup
  ) => {
    setIsLoading(true);
    setFormError(null);

    try {
      const result = await action(formData);

      if (result?.error) {
        setFormError(result.error);
        toast.error(result.error);
      }
    } catch (error) {
      console.error("Authentication error:", error);
      setFormError("An unexpected error occurred. Please try again.");
      toast.error("Authentication failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Get button configuration based on auth mode
  const buttonConfig = isLogin
    ? {
        action: login,
        text: "Sign In",
        loadingText: "Signing in...",
        className: "bg-emerald-500 hover:bg-emerald-700 focus:ring-emerald-400",
      }
    : {
        action: signup,
        text: "Sign Up",
        loadingText: "Creating account...",
        className: "bg-emerald-500 hover:bg-emerald-700 focus:ring-emerald-400",
      };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-neutral-800">
      <Toaster position="top-right" />

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Searchable Images</h1>
          <p className="text-gray-500 mt-2">
            {isLogin ? "Sign in to your account" : "Create a new account"}
          </p>
        </div>

        <form className="p-8 rounded-lg shadow-md space-y-4">
          <FormInput
            id="email"
            type="email"
            label="Email"
            placeholder="your.email@example.com"
            disabled={isLoading}
          />

          <FormInput
            id="password"
            type="password"
            label="Password"
            placeholder="••••••••"
            disabled={isLoading}
          />

          {formError && (
            <div className="text-sm text-red-600 p-2 bg-red-50 rounded">
              {formError}
            </div>
          )}

          <button
            type="submit"
            formAction={(formData) =>
              handleAction(formData, buttonConfig.action)
            }
            className={`w-full py-2 px-4 text-white rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${buttonConfig.className}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <LoadingSpinner />
                {buttonConfig.loadingText}
              </span>
            ) : (
              buttonConfig.text
            )}
          </button>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-md text-gray-500"
              disabled={isLoading}
            >
              {isLogin ? (
                <>
                  <span>Need an account? </span>
                  <span className="text-emerald-500 hover:text-emerald-600">
                    Sign up
                  </span>
                </>
              ) : (
                <>
                  <span>Already have an account? </span>
                  <span className="text-emerald-500 hover:text-emerald-600">
                    Sign in
                  </span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
