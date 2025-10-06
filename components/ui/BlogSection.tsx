import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

const BlogPostCard = ({ title, description, link, image }: { title: string, description: string, link: string, image: string }) => (
    <Link href={link}>
        <div className="group rounded-xl border border-white/15 bg-black/30 overflow-hidden h-full flex flex-col transition-all hover:border-purple-500/50 hover:bg-purple-900/10">
            <Image src={image} alt={title} width={500} height={300} className="w-full h-48 object-cover" />
            <div className="p-6 flex-grow flex flex-col">
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm text-white/70 flex-grow">{description}</p>
                <div className="mt-4 flex items-center gap-2 text-purple-400 font-semibold text-sm group-hover:gap-3 transition-all">
                    Read More <ArrowRight size={16} />
                </div>
            </div>
        </div>
    </Link>
);

export default function BlogSection() {
    return (
        <div className="py-24">
            <div className="text-center">
                <h2 className="text-sm font-semibold text-purple-400">From the Blog</h2>
                <p className="mt-2 text-4xl font-bold tracking-tight text-white sm:text-5xl">Latest Insights & Tutorials</p>
            </div>
            <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <BlogPostCard title="The Rise of Agentic AI: A New Paradigm" description="Exploring the shift from task-specific models to autonomous, goal-driven agents." link="#" image="/blog1.jpg" />
                <BlogPostCard title="Tutorial: Building a Multi-modal Agent with Agenta" description="A step-by-step guide to creating an agent that can understand both text and images." link="#" image="/blog2.jpg" />
                <BlogPostCard title="Deep Dive: The Importance of State Persistence in AI Agents" description="Why durable memory is the key to building truly intelligent and reliable agents." link="#" image="/blog3.jpg" />
            </div>
        </div>
    );
}