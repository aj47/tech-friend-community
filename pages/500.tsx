export default function Custom500() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-4">
      <div className="max-w-xl w-full bg-[#111111] border border-[#222222] rounded-xl p-8 text-center">
        <div className="inline-flex items-center px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-full mb-6">
          <span className="text-red-300 text-sm font-medium">
            Something went wrong
          </span>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
          Server error
        </h1>
        <p className="text-gray-400 mb-8">
          Please refresh and try again. If it keeps happening, head back to
          browse projects.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 bg-[#00FF41] text-black font-medium rounded-lg hover:bg-[#00DD35]"
          >
            Go to Home
          </a>
          <a
            href="/projects"
            className="inline-flex items-center justify-center px-6 py-3 border border-[#333333] text-white rounded-lg hover:border-[#00FF41]"
          >
            Browse Projects
          </a>
        </div>

        <p className="text-xs text-gray-600 mt-8">
          Thanks for your patience — we’re working on it.
        </p>
      </div>
    </div>
  );
}
