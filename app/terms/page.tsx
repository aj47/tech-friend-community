import Link from "next/link";
import { Navbar } from "@/components/Navbar";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-white mb-2">Terms of Service</h1>
        <p className="text-sm text-gray-500 mb-8">
          Not legal advice. This is a plain-language summary provided for an open
          source community project.
        </p>

        <div className="space-y-8 text-gray-300 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">1. Overview</h2>
            <p>
              Tech Friend Community is a place to share projects, collaborate on
              open source, and support fellow builders. By using the site, you
              agree to behave respectfully and follow these terms.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">2. Accounts</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                You may sign in using GitHub. You are responsible for activity
                performed through your account.
              </li>
              <li>
                Don’t impersonate others or misrepresent your affiliation with a
                project.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">3. Acceptable use</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>No harassment, hate, or abuse.</li>
              <li>No spam, scams, or attempts to deceive other members.</li>
              <li>No unauthorized access, scraping, or disruption of the service.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">4. Open source work</h2>
            <p>
              Projects and contributions are often governed by their own
              repositories’ licenses and contribution guidelines. Make sure you
              understand the rules of the repo you’re contributing to.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">5. Disclaimers</h2>
            <p>
              The service is provided “as is” without warranties. We can’t
              guarantee uninterrupted availability or that content is accurate.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">6. Privacy</h2>
            <p>
              Please review our{" "}
              <Link href="/privacy" className="text-[#00FF41] hover:underline">
                Privacy Policy
              </Link>
              {" "}to understand what information we collect and how we use it.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-white">7. Contact</h2>
            <p>
              Questions? Open an issue in the repository or reach out through the
              community channels.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

