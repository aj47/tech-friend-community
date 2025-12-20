import Link from "next/link";
import { Navbar } from "@/components/Navbar";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-white mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-500 mb-8">
          Not legal advice. This is a plain-language summary provided for an open
          source community project.
        </p>

        <div className="space-y-8 text-gray-300 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">1. What we collect</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                Account info from GitHub (for example: username, display name,
                and profile image).
              </li>
              <li>
                Community activity you submit (projects, contributions, rewards
                redemptions, and notifications).
              </li>
              <li>
                Basic usage information needed to operate the service and keep it
                secure.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">2. How we use data</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>To authenticate you and personalize your experience.</li>
              <li>To power features like points, rewards, and notifications.</li>
              <li>To prevent abuse and keep the platform reliable.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">3. Sharing</h2>
            <p>
              We don't sell your personal information. We may share data only as
              needed to run the service (for example, infrastructure providers)
              or when required by law.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">4. Retention</h2>
            <p>
              We keep information as long as necessary to provide the service and
              support the community. If you have questions about deletion,
              please reach out.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">5. Your choices</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>You can sign out at any time.</li>
              <li>
                You can contact us to request help accessing or deleting account
                data.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">6. Terms</h2>
            <p>
              Please also review our{" "}
              <Link href="/terms" className="text-[#00FF41] hover:underline">
                Terms of Service
              </Link>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

