export default function HowItWorksSection() {
  return (
    <div className="py-24">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-sm font-semibold text-purple-400">How It Works</h2>
        <p className="mt-2 text-4xl font-bold tracking-tight text-white sm:text-5xl">
          Develop Agents in 3 Simple Steps
        </p>
      </div>

      {/* Steps Grid */}
      <div className="mt-16 grid grid-cols-1 gap-12 text-center md:grid-cols-3">
        {/* Step 1 */}
        <div className="flex flex-col items-center">
          <div className="flex items-center justify-center w-16 h-16 bg-purple-900/50 border border-purple-500 rounded-full text-2xl font-bold text-purple-300">
            1
          </div>
          <h3 className="mt-6 text-xl font-semibold">Define Your Agent</h3>
          <p className="mt-2 text-white/70">
            Use our intuitive dashboard to configure your agent&apos;s LLM,
            tools, and memory persistence.
          </p>
        </div>

        {/* Step 2 */}
        <div className="flex flex-col items-center">
          <div className="flex items-center justify-center w-16 h-16 bg-purple-900/50 border border-purple-500 rounded-full text-2xl font-bold text-purple-300">
            2
          </div>
          <h3 className="mt-6 text-xl font-semibold">Test and Iterate</h3>
          <p className="mt-2 text-white/70">
            Leverage built-in chat interfaces and token tracking to test and
            refine your agent&apos;s behavior.
          </p>
        </div>

        {/* Step 3 */}
        <div className="flex flex-col items-center">
          <div className="flex items-center justify-center w-16 h-16 bg-purple-900/50 border border-purple-500 rounded-full text-2xl font-bold text-purple-300">
            3
          </div>
          <h3 className="mt-6 text-xl font-semibold">Deploy and Scale</h3>
          <p className="mt-2 text-white/70">
            Expose your agent via API and let Cortex handle multi-tenancy, state,
            and scalability.
          </p>
        </div>
      </div>
    </div>
  )
}
