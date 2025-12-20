import { Navbar } from "@/components/Navbar";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-white mb-2">Terms of Service</h1>
        <p className="text-gray-500 mb-8">Last updated: 2025-12-20</p>

        <div className="bg-[#111111] border border-[#222222] rounded-lg p-6 space-y-4 text-gray-300">
          <p>
            Tech Friend Community is a platform for sharing projects and recognizing
            contributions. By using the site, you agree to use it responsibly and
            comply with applicable laws.
          </p>
          <p>
            You are responsible for any content you submit (projects, links, and
            contributions). Do not post sensitive information.
          </p>
          <p>
            Rewards and points are provided on a best-effort basis and may change
            over time. Abuse, spam, or fraudulent submissions may result in account
            restrictions.
          </p>
          <p>
            This document is a simple placeholder for early-stage usage. If you
            need a production-grade Terms of Service, replace this page with a
            legally reviewed version.
          </p>
        </div>
      </div>
    </div>
  );
}
