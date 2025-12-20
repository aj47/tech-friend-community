"use client";

import Link from "next/link";
import { useEffect } from "react";
import { AlertTriangle, RefreshCcw, ArrowRight } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Keep this in the client so we capture useful diagnostics without breaking the build.
    // eslint-disable-next-line no-console
    console.error("Global error boundary:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-4">
        <div className="max-w-xl w-full bg-[#111111] border border-[#222222] rounded-xl p-8">
          <div className="flex items-start gap-3">
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white">
                Something went wrong
              </h1>
              <p className="text-gray-400 mt-1">
                Try again, or head back to discover projects to contribute to.
              </p>
              {error?.digest ? (
                <p className="text-xs text-gray-600 mt-2">Digest: {error.digest}</p>
              ) : null}
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => reset()}
              className="inline-flex items-center justify-center px-6 py-3 bg-[#00FF41] text-black font-medium rounded-lg hover:bg-[#00DD35]"
            >
              <RefreshCcw className="w-4 h-4 mr-2" />
              Try again
            </button>
            <Link
              href="/projects"
              className="inline-flex items-center justify-center px-6 py-3 border border-[#333333] text-white rounded-lg hover:border-[#00FF41]"
            >
              Browse Projects
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
