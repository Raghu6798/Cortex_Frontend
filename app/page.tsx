'use client';

import React from 'react';


import { SectionReveal } from '@/components/ui/general/SectionReveal';
import Header from '@/components/layout/Header'; 
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/ui/general/HeroSection';
import LogosSection from '@/components/ui/general/LogosSection';
import ProblemSection from '@/components/ui/general/ProblemSection';
import SolutionSection from '@/components/ui/general/SolutionSection';
import HowItWorksSection from '@/components/ui/general/HowItWorksSection';
import TestimonialHighlightSection from '@/components/ui/general/TestimonialHighlightSection';
import FeaturesSection from '@/components/ui/general/FeaturesSection';
import { AnimatedTestimonials } from '@/components/ui/general/animated-testimonials';
import PricingSection from '@/components/ui/general/PricingPlan'; 
import FAQSection from '@/components/ui/general/FAQSection';
import BlogSection from '@/components/ui/general/BlogSection';
import CTASection from '@/components/ui/general/CTASection';

// --- THIS IS THE MODIFIED DATA ARRAY ---
const testimonials = [
  {
    quote: "Cortex transformed our development workflow. Building, testing, and deploying agents has never been this seamless. The ability to switch LLMs on the fly is a game-changer for our multi-tenant applications.",
    name: "Jane Doe",
    designation: "Lead AI Engineer, InnovateCorp",
    // This URL will fetch a random 500x500 portrait image. The '&sig=1' ensures it's a unique image.
    src: "https://images.prismic.io/turing/652ec6fefbd9a45bcec81a1f_Coder_a63a8aeefd.webp?auto=format,compress", 
  },
  {
    quote: "The observability and monitoring tools are top-notch. We can track token usage, latency, and throughput in real-time, which is crucial for maintaining our production-grade services.",
    name: "John Smith",
    designation: "CTO, Future Solutions",
    src: "https://pg-p.ctme.caltech.edu/wp-content/uploads/sites/4/2023/12/What-Do-Coders-Do.jpg",
  },
  {
    quote: "As a startup, we need to move fast. Agenta’s unified environment saves us countless hours. The persistent memory with Postgres is incredibly robust and easy to manage.",
    name: "Emily White",
    designation: "Founder, AI Ventures",
    src: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRZulXgU_VPgK8yPyn8bCVMOofRqjO3Kdlgqw&s",
  },
];
// --- END OF MODIFIED DATA ---


export default function Page() {

  const [isCompact, setIsCompact] = React.useState(false);
  const lastY = React.useRef(0);

  React.useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY || 0;
      const delta = y - lastY.current;
      
      if (y > 16 && delta > 0 && !isCompact) {
        setIsCompact(true);
      }
      if ((delta < -2 || y <= 16) && isCompact) {
        setIsCompact(false);
      }
      lastY.current = y;
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isCompact]);

  return (
    <main className="relative min-h-screen w-full bg-black text-white dark">

      <div className="relative z-10">
        
        <Header isCompact={isCompact} />
        
        <HeroSection />
        <SectionReveal>
        <div className="bg-black/50">
          <LogosSection />
        </div>
        </SectionReveal>

        <SectionReveal>
        <div className="relative mx-auto my-8 max-w-7xl rounded-3xl bg-black/50 px-6 py-16">
          <ProblemSection />
          <SolutionSection />
          <HowItWorksSection />
          <TestimonialHighlightSection />
          <FeaturesSection />
        </div>
        </SectionReveal>
        
        <SectionReveal>
        <div className="bg-black/50">
          <AnimatedTestimonials testimonials={testimonials} autoplay={true} />
          <PricingSection />
        </div>
        </SectionReveal>
 
        <SectionReveal>
        <div className="relative mx-auto my-8 max-w-7xl rounded-3xl bg-black/50 px-6 py-16">
          <FAQSection />
          <BlogSection />
          <CTASection />
        </div>
        </SectionReveal>

        <Footer />
      </div>
    </main>
  );
}
