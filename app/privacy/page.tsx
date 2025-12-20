import { Navbar } from "@/components/Navbar";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-white mb-2">Privacy Policy</h1>
        <p className="text-gray-500 mb-8">Last updated: 2025-12-20</p>

        <div className="bg-[#111111] border border-[#222222] rounded-lg p-6 space-y-4 text-gray-300">
          <p>
            We use GitHub OAuth for authentication. We store basic profile
            information (e.g., username, avatar) and platform activity (projects,
            contributions, points, rewards) to operate the service.
          </p>
          <p>
            We do not sell your personal information. Links you submit (such as
            GitHub URLs) may be visible to other users.
          </p>
          <p>
            This page is an early-stage placeholder. Replace it with a
            production-grade privacy policy as needed.
          </p>
        </div>
      </div>
    </div>
  );
}
