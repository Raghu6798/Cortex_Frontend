import Link from 'next/link';

export default function CTASection() {
    return (
        <div className="py-24">
            <div className="text-center p-12 rounded-3xl bg-gradient-to-r from-purple-600 to-indigo-600">
                <h2 className="text-4xl font-bold tracking-tight text-white">Ready to Build Your First Agent?</h2>
                <p className="mt-4 mx-auto max-w-2xl text-lg text-white/90">
                    Stop wrestling with infrastructure and start creating intelligent agents. Get started with Cortex for free, no credit card required.
                </p>
                <div className="mt-8">
                    <Link href="/sign-up" className="rounded-lg bg-white px-8 py-4 font-medium text-black shadow-lg hover:bg-white/90 transition-transform hover:scale-105 inline-block">
                        Get Started for Free
                    </Link>
                </div>
            </div>
        </div>
    );
}