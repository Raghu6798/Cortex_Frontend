'use client';

import React, { useRef } from 'react';
import { motion, useInView, Variants } from 'framer-motion'; // Import Variants type
import { FaGithub, FaTwitter, FaLinkedin } from 'react-icons/fa';
import Link from 'next/link';
import Image from 'next/image';

const Footer = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  // --- FIX: Define the type for the variants object ---
  const footerVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        // --- FIX: Use a valid Easing function array instead of a string ---
        ease: [0, 0, 0.2, 1],
      },
    },
  };

  return (
    <motion.footer
      ref={ref}
      variants={footerVariants}
      initial="hidden"
      // --- FIX: Use the useInView result directly for the animate prop ---
      animate={isInView ? "visible" : "hidden"}
      className="bg-black text-white border-t border-white/10 px-6 pt-16 pb-8"
    >
      <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 text-center md:text-left">
        {/* Column 1: Agenta ADE Branding & Socials */}
        <div className="flex flex-col items-center md:items-start">
          <div className="flex items-center gap-3">
            <Image
              src="/download.png"
              alt="Agenta logo"
              width={40}
              height={40}
              className="rounded-sm"
            />
            <span className="font-semibold tracking-widest text-lg">
              Cortex
            </span>
          </div>
          <p className="mt-4 text-sm text-white/70 max-w-xs">
            Your comprehensive Agent Development Environment (ADE) for building, testing, and deploying production-grade AI agents.
          </p>
          <div className="mt-6 flex justify-center md:justify-start gap-5">
            <a href="https://github.com/agentadevs/agenta" target="_blank" rel="noreferrer" aria-label="GitHub" className="text-white/70 hover:text-white transition-colors">
              <FaGithub size={22} />
            </a>
            <a href="https://twitter.com/your-agenta-handle" target="_blank" rel="noreferrer" aria-label="Twitter" className="text-white/70 hover:text-white transition-colors">
              <FaTwitter size={22} />
            </a>
            <a href="https://linkedin.com/company/your-agenta-company" target="_blank" rel="noreferrer" aria-label="LinkedIn" className="text-white/70 hover:text-white transition-colors">
              <FaLinkedin size={22} />
            </a>
          </div>
        </div>

        {/* Column 2: Product & Features */}
        <div>
          <h3 className="text-base font-semibold text-white uppercase tracking-wider">
            Product
          </h3>
          <ul className="mt-4 space-y-2">
            <li>
              <Link href="/features#llm-context" className="text-sm text-white/70 hover:text-white transition-colors">
                LLM & Context Management
              </Link>
            </li>
            <li>
              <Link href="/features#persistence" className="text-sm text-white/70 hover:text-white transition-colors">
                Persistent Memory & State (Postgres)
              </Link>
            </li>
            <li>
              <Link href="/features#multimodal-chat" className="text-sm text-white/70 hover:text-white transition-colors">
                Multimodal Chat & Inputs
              </Link>
            </li>
            <li>
              <Link href="/features#agents" className="text-sm text-white/70 hover:text-white transition-colors">
                Pre-configured & Custom Agents
              </Link>
            </li>
            <li>
              <Link href="/features#sandboxes" className="text-sm text-white/70 hover:text-white transition-colors">
                Secure Code Sandboxes
              </Link>
            </li>
            <li>
              <Link href="/features#tools" className="text-sm text-white/70 hover:text-white transition-colors">
                Web Search & MCP Tools
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 3: Developers */}
        <div>
          <h3 className="text-base font-semibold text-white uppercase tracking-wider">
            Developers
          </h3>
          <ul className="mt-4 space-y-2">
            <li>
              <Link href="/docs" className="text-sm text-white/70 hover:text-white transition-colors">
                Documentation
              </Link>
            </li>
            <li>
              <Link href="/api-reference" className="text-sm text-white/70 hover:text-white transition-colors">
                API Reference
              </Link>
            </li>
            <li>
              <Link href="/agentfile-spec" className="text-sm text-white/70 hover:text-white transition-colors">
                Agentfile Specification
              </Link>
            </li>
            <li>
              <Link href="/tutorials" className="text-sm text-white/70 hover:text-white transition-colors">
                Tutorials & Guides
              </Link>
            </li>
            <li>
              <a href="https://github.com/agentadevs/agenta/discussions" target="_blank" rel="noreferrer" className="text-sm text-white/70 hover:text-white transition-colors">
                Community Forum
              </a>
            </li>
          </ul>
        </div>

        {/* Column 4: Company & Legal */}
        <div>
          <h3 className="text-base font-semibold text-white uppercase tracking-wider">
            Company
          </h3>
          <ul className="mt-4 space-y-2">
            <li>
              <Link href="/about" className="text-sm text-white/70 hover:text-white transition-colors">
                About Cortex
              </Link>
            </li>
            <li>
              <Link href="/blog" className="text-sm text-white/70 hover:text-white transition-colors">
                Blog
              </Link>
            </li>
            <li>
              <Link href="/careers" className="text-sm text-white/70 hover:text-white transition-colors">
                Careers
              </Link>
            </li>
            <li>
              <Link href="/contact" className="text-sm text-white/70 hover:text-white transition-colors">
                Contact Us
              </Link>
            </li>
          </ul>
          <h3 className="text-base font-semibold text-white uppercase tracking-wider mt-8">
            Legal
          </h3>
          <ul className="mt-4 space-y-2">
            <li>
              <Link href="/privacy" className="text-sm text-white/70 hover:text-white transition-colors">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/terms" className="text-sm text-white/70 hover:text-white transition-colors">
                Terms of Service
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-12 pt-8 border-t border-white/10 text-center">
        <p className="text-sm text-white/50">
          &copy; {new Date().getFullYear()} Cortex. All rights reserved.
        </p>
      </div>
    </motion.footer>
  );
};

export default Footer;
