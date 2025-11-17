import { cn } from '@/lib/utils';

interface HowItWorksSectionProps {
  isDarkMode?: boolean;
}

export default function HowItWorksSection({ isDarkMode = true }: HowItWorksSectionProps) {
  return (
    <div className="py-24">
      {/* Header */}
      <div className="text-center">
        <h2 className={cn("text-sm font-semibold", isDarkMode ? "text-purple-400" : "text-purple-600")}>How It Works</h2>
        <p className={cn("mt-2 text-4xl font-bold tracking-tight sm:text-5xl", isDarkMode ? "text-white" : "text-black")}>
          Develop Text & Voice Agents in 3 Simple Steps
        </p>
      </div>

      {/* Steps Grid */}
      <div className="mt-16 grid grid-cols-1 gap-12 text-center md:grid-cols-3">
        {/* Step 1 */}
        <div className="flex flex-col items-center">
          <div className={cn(
            "flex items-center justify-center w-16 h-16 border rounded-full text-2xl font-bold",
            isDarkMode 
              ? "bg-purple-900/50 border-purple-500 text-purple-300"
              : "bg-purple-100 border-purple-500 text-purple-700"
          )}>
            1
          </div>
          <h3 className={cn("mt-6 text-xl font-semibold", isDarkMode ? "text-white" : "text-black")}>Define Your Agent</h3>
          <p className={cn("mt-2", isDarkMode ? "text-white/70" : "text-black/70")}>
            Use our intuitive dashboard to configure your agent&apos;s LLM,
            tools, memory persistence, and voice capabilities with LiveKit integration.
          </p>
        </div>

        {/* Step 2 */}
        <div className="flex flex-col items-center">
          <div className={cn(
            "flex items-center justify-center w-16 h-16 border rounded-full text-2xl font-bold",
            isDarkMode 
              ? "bg-purple-900/50 border-purple-500 text-purple-300"
              : "bg-purple-100 border-purple-500 text-purple-700"
          )}>
            2
          </div>
          <h3 className={cn("mt-6 text-xl font-semibold", isDarkMode ? "text-white" : "text-black")}>Test and Iterate</h3>
          <p className={cn("mt-2", isDarkMode ? "text-white/70" : "text-black/70")}>
            Leverage built-in chat interfaces, voice testing, and token tracking to test and
            refine your agent&apos;s behavior across text and voice interactions.
          </p>
        </div>

        {/* Step 3 */}
        <div className="flex flex-col items-center">
          <div className={cn(
            "flex items-center justify-center w-16 h-16 border rounded-full text-2xl font-bold",
            isDarkMode 
              ? "bg-purple-900/50 border-purple-500 text-purple-300"
              : "bg-purple-100 border-purple-500 text-purple-700"
          )}>
            3
          </div>
          <h3 className={cn("mt-6 text-xl font-semibold", isDarkMode ? "text-white" : "text-black")}>Deploy and Scale</h3>
          <p className={cn("mt-2", isDarkMode ? "text-white/70" : "text-black/70")}>
            Expose your agent via API and WebRTC for voice interactions. Let Cortex handle multi-tenancy, state,
            scalability, and real-time audio processing.
          </p>
        </div>
      </div>
    </div>
  )
}
