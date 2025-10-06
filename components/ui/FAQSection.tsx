const FAQItem = ({ question, answer }: { question: string, answer: string }) => (
    <details className="py-4 border-b border-white/20 group">
        <summary className="flex justify-between items-center cursor-pointer list-none">
            <span className="font-medium text-lg">{question}</span>
            <span className="transition-transform duration-300 group-open:rotate-180">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </span>
        </summary>
        <p className="mt-4 text-white/80">{answer}</p>
    </details>
);

export default function FAQSection() {
    return (
        <div className="py-24">
            <div className="text-center">
                <h2 className="text-sm font-semibold text-purple-400">FAQ</h2>
                <p className="mt-2 text-4xl font-bold tracking-tight text-white sm:text-5xl">Frequently Asked Questions</p>
            </div>
            <div className="mt-12 max-w-4xl mx-auto">
                <FAQItem question="Is Cortex open-source?" answer="Yes! The core Cortex platform is open-source under the MIT license. You can find our repository on GitHub." />
                <FAQItem question="What LLMs do you support?" answer="We support all major providers like OpenAI, Anthropic, and Cohere out of the box. You can also connect to any custom endpoint, including locally hosted models." />
                <FAQItem question="How does multi-tenancy work?" answer="Cortex isolates data at the database level using Postgres schemas. Each tenant (user or organization) gets their own sandboxed environment for memory and state, ensuring data privacy." />
                <FAQItem question="Can I self-host Cortex?" answer="Absolutely. We provide a Docker-based setup for easy self-hosting. An enterprise plan is available for those who require dedicated support for on-premise deployments." />
            </div>
        </div>
    );
}