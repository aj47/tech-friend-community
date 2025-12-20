export default function Custom404() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-4">
      <div className="max-w-xl w-full bg-[#111111] border border-[#222222] rounded-xl p-8 text-center">
        <div className="inline-flex items-center px-4 py-2 bg-[#00FF41]/10 border border-[#00FF41]/20 rounded-full mb-6">
          <span className="text-[#00FF41] text-sm font-medium">
            Tech Friend Community
          </span>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
          Page not found
        </h1>
        <p className="text-gray-400 mb-8">
          That link doesn’t exist (or it moved). Here are a couple of good next
          steps.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="/projects"
            className="inline-flex items-center justify-center px-6 py-3 bg-[#00FF41] text-black font-medium rounded-lg hover:bg-[#00DD35]"
          >
            Browse Projects
          </a>
          <a
            href="/projects/submit"
            className="inline-flex items-center justify-center px-6 py-3 border border-[#333333] text-white rounded-lg hover:border-[#00FF41]"
          >
            Submit Your Project
          </a>
        </div>

        <p className="text-xs text-gray-600 mt-8">
          Tip: verified contributions earn points and unlock tiers + rewards.
        </p>
      </div>
    </div>
  );
}
