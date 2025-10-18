'use client';

import { useState } from 'react';
import { Check, Zap } from 'lucide-react';
import { Switch } from '@/components/ui/shadcn/switch';
import { Label } from '@/components/ui/shadcn/label';
import { cn } from '@/lib/utils';
// --- 1. IMPORT THE NEW ELECTRICBORDER COMPONENT ---
import ElectricBorder from './ElectricBorder'; // Assuming it's in the same directory

// --- Data for the pricing plans ---
const pricingPlans = {
  monthly: [
    {
      name: 'Developer',
      price: '$29',
      period: '/month',
      description: 'For individual developers and small teams getting started.',
      features: ['10 Active Agents', '50,000 Tokens/mo', 'Community Support', 'Basic Analytics'],
      isPopular: false,
    },
    {
      name: 'Pro',
      price: '$99',
      period: '/month',
      description: 'For growing teams building production-grade applications.',
      features: [
        '50 Active Agents',
        '250,000 Tokens/mo',
        'Priority Email Support',
        'Advanced Analytics',
        'Team Collaboration',
      ],
      isPopular: true,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      description: 'For large organizations with specific security and support needs.',
      features: [
        'Unlimited Agents',
        'Custom Token Limits',
        'Dedicated Support & SLA',
        'On-premise Deployment',
        'Custom Integrations',
      ],
      isPopular: false,
    },
  ],
  annually: [
    {
      name: 'Developer',
      price: '$290',
      period: '/year',
      description: 'For individual developers and small teams getting started.',
      features: ['10 Active Agents', '50,000 Tokens/mo', 'Community Support', 'Basic Analytics'],
      isPopular: false,
    },
    {
      name: 'Pro',
      price: '$990',
      period: '/year',
      description: 'For growing teams building production-grade applications.',
      features: [
        '50 Active Agents',
        '250,000 Tokens/mo',
        'Priority Email Support',
        'Advanced Analytics',
        'Team Collaboration',
      ],
      isPopular: true,
    },
    {
      name: 'Enterprise',
      price: 'Contact Us',
      period: '',
      description: 'For large organizations with specific security and support needs.',
      features: [
        'Unlimited Agents',
        'Custom Token Limits',
        'Dedicated Support & SLA',
        'On-premise Deployment',
        'Custom Integrations',
      ],
      isPopular: false,
    },
  ],
};

export default function PricingSection() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annually'>('monthly');

  const plans = pricingPlans[billingCycle];

  return (
    <section className="relative w-full overflow-hidden py-20 sm:py-24">
      {/* Background Gradient */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-black" />
        <div
          className="absolute inset-x-0 top-0 h-[800px] w-full"
          style={{
            background:
              'radial-gradient(ellipse 80% 50% at 50% -20%,rgba(168,85,247,0.3), transparent)',
          }}
        />
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-5xl">
            Pricing Plans for Every Scale
          </h2>
          <p className="mt-4 text-lg leading-8 text-white/70">
            Choose the right plan to build, test, and deploy your AI agents, from solo projects to
            enterprise-level solutions.
          </p>
        </div>

        {/* Billing Cycle Toggle */}
        <div className="mt-16 flex justify-center">
          <div className="flex items-center space-x-4">
            <Label htmlFor="billing-cycle" className="text-white/80">
              Monthly
            </Label>
            <Switch
              id="billing-cycle"
              checked={billingCycle === 'annually'}
              onCheckedChange={(checked) => setBillingCycle(checked ? 'annually' : 'monthly')}
            />
            <Label htmlFor="billing-cycle" className="text-white/80">
              Annually (Save 20%)
            </Label>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="isolate mx-auto mt-10 grid max-w-md grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {plans.map((plan) => (
            // --- 2. WRAP THE PRICING CARD DIV WITH ElectricBorder ---
            <ElectricBorder
              key={plan.name}
              // Customize props for the popular plan
              color={plan.isPopular ? '#a855f7' : '#5227FF'} // Highlight popular plan with a different color
              chaos={plan.isPopular ? 1.2 : 0.8}
              speed={plan.isPopular ? 1.5 : 1}
              thickness={2}
              className={cn(
                'rounded-3xl p-8 transition-transform hover:scale-105',
                plan.isPopular ? 'shadow-2xl shadow-purple-500/20' : ''
              )}
            >
              {/* This is the original card content, now passed as children */}
              <div className="flex h-full flex-col bg-black/50 backdrop-blur-sm p-1 rounded-2xl">
                {plan.isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 transform">
                    <div className="flex items-center gap-x-2 rounded-full bg-purple-600 px-4 py-1.5 text-xs font-semibold text-white">
                      <Zap size={14} /> Most Popular
                    </div>
                  </div>
                )}
                <h3 className="text-2xl font-semibold leading-8 text-white">{plan.name}</h3>
                <p className="mt-4 text-sm leading-6 text-white/70">{plan.description}</p>
                <p className="mt-6 flex items-baseline gap-x-1">
                  <span className="text-4xl font-bold tracking-tight text-white">{plan.price}</span>
                  <span className="text-sm font-semibold leading-6 text-white/70">
                    {plan.period}
                  </span>
                </p>
                <a
                  href="#"
                  className={cn(
                    'mt-6 block w-full rounded-md py-2 text-center text-sm font-semibold leading-6',
                    plan.isPopular
                      ? 'bg-purple-600 text-white hover:bg-purple-500'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  )}
                >
                  Get Started
                </a>
                <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-white/80">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex gap-x-3">
                      <Check className="h-6 w-5 flex-none text-purple-400" aria-hidden="true" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </ElectricBorder>
          ))}
        </div>
      </div>
    </section>
  );
}
