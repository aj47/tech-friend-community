"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { Hammer, Github } from "lucide-react";
import Link from "next/link";

export default function SignInPage() {
  const { signIn } = useAuthActions();

  const handleGitHubSignIn = () => {
    void signIn("github", { redirectTo: window.location.origin });
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center">
            <Hammer className="h-12 w-12 text-[#00FF41]" />
            <span className="ml-2 text-2xl sm:text-3xl font-bold text-white">
              Tech Friend Community
            </span>
          </Link>
          <p className="mt-4 text-gray-400">
            Sign in to accelerate open source by building together
          </p>
        </div>

        {/* Sign In Card */}
        <div className="bg-[#111111] rounded-lg border border-[#222222] p-8">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            Welcome
          </h2>

          <button
            onClick={handleGitHubSignIn}
            className="w-full flex items-center justify-center space-x-3 px-6 py-3 bg-white text-black rounded-lg hover:bg-gray-100 transition-colors font-medium"
          >
            <Github className="h-5 w-5" />
            <span>Sign in with GitHub</span>
          </button>

          <div className="mt-6 text-center text-sm text-gray-500">
            <p>
              By signing in, you agree to our{" "}
              <Link href="/terms" className="text-[#00FF41] hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-[#00FF41] hover:underline">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 mb-4">What you can do:</p>
          <div className="grid grid-cols-3 gap-4 text-xs text-gray-400">
            <div>
              <div className="bg-[#00FF41]/10 rounded-lg p-3 mb-2 text-lg">
                🛠️
              </div>
              Submit Projects
            </div>
            <div>
              <div className="bg-[#00FF41]/10 rounded-lg p-3 mb-2 text-lg">
                🤝
              </div>
              Contribute
            </div>
            <div>
              <div className="bg-[#00FF41]/10 rounded-lg p-3 mb-2 text-lg">
                🎁
              </div>
              Earn Rewards
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
