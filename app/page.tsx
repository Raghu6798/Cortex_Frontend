'use client';

import React from 'react';
import { motion } from 'framer-motion';


import { SectionReveal } from '@/components/ui/general/SectionReveal';
import Header from '@/components/layout/Header';
import { cn } from '@/lib/utils'; 
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/ui/general/HeroSection';
import LogosSection from '@/components/ui/general/LogosSection';
import SolutionSection from '@/components/ui/general/SolutionSection';
import HowItWorksSection from '@/components/ui/general/HowItWorksSection';
import TestimonialHighlightSection from '@/components/ui/general/TestimonialHighlightSection';
import FeaturesSection from '@/components/ui/general/FeaturesSection';
import { AnimatedTestimonials } from '@/components/ui/general/animated-testimonials';
import PricingSection from '@/components/ui/general/PricingPlan'; 
import FAQSection from '@/components/ui/general/FAQSection';
import BlogSection from '@/components/ui/general/BlogSection';
import CTASection from '@/components/ui/general/CTASection';
import ChallengeBentoGrid from '@/components/ui/general/ChallengeBentoGrid';

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
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [isCompact, setIsCompact] = React.useState(false);
  const [isDarkMode, setIsDarkMode] = React.useState(true);
  const lastY = React.useRef(0);

  React.useEffect(() => {
    // Trigger page load animation
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

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

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  return (
    <motion.main 
      className={cn(
        "relative min-h-screen w-full transition-colors duration-500 ease-in-out",
        isDarkMode ? "bg-black text-white" : "bg-white text-black"
      )}
      initial={{ opacity: 0 }}
      animate={{ opacity: isLoaded ? 1 : 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <motion.div 
        className="relative z-10"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: isLoaded ? 0 : 20, opacity: isLoaded ? 1 : 0 }}
        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
      >
        <Header isCompact={isCompact} isDarkMode={isDarkMode} onToggleTheme={toggleTheme} />
        
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: isLoaded ? 0 : 30, opacity: isLoaded ? 1 : 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
        >
          <HeroSection isDarkMode={isDarkMode} />
        </motion.div>
        <SectionReveal>
        <div className={cn("transition-colors duration-500", isDarkMode ? "bg-black/50" : "bg-white/50")}>
          <LogosSection isDarkMode={isDarkMode} />
        </div>
        </SectionReveal>

        <SectionReveal>
        <div className={cn("relative mx-auto my-8 max-w-7xl rounded-3xl px-6 py-16 transition-colors duration-500", isDarkMode ? "bg-black/50" : "bg-white/50")}>
          <SolutionSection isDarkMode={isDarkMode} />
          <HowItWorksSection isDarkMode={isDarkMode} />
          <TestimonialHighlightSection isDarkMode={isDarkMode} />
          <FeaturesSection isDarkMode={isDarkMode} />
        </div>
        </SectionReveal>

        <SectionReveal>
        <div className={cn("transition-colors duration-500", isDarkMode ? "bg-black/30" : "bg-white/30")}>
          <ChallengeBentoGrid />
        </div>
        </SectionReveal>
        
        <SectionReveal>
        <div className={cn("transition-colors duration-500", isDarkMode ? "bg-black/50" : "bg-white/50")}>
          <AnimatedTestimonials testimonials={testimonials} autoplay={true} />
          <PricingSection />
        </div>
        </SectionReveal>
 
        <SectionReveal>
        <div className={cn("relative mx-auto my-8 max-w-7xl rounded-3xl px-6 py-16 transition-colors duration-500", isDarkMode ? "bg-black/50" : "bg-white/50")}>
          <FAQSection />
          <BlogSection />
          <CTASection />
        </div>
        </SectionReveal>

        <Footer />
      </motion.div>
    </motion.main>
  );
}
