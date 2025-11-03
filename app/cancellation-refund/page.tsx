'use client';

import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function CancellationRefundPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Header isCompact={false} />
      <main className="mx-auto max-w-4xl px-6 py-16">
        <h1 className="text-4xl font-bold mb-8">Cancellation and Refund Policy</h1>
        <p className="text-white/70 mb-8">Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

        <div className="prose prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
            <p className="text-white/80 leading-relaxed">
              This Cancellation and Refund Policy ("Policy") outlines the terms and conditions for canceling subscriptions and requesting refunds for services provided by Cortex. Please read this Policy carefully before making any purchase or subscription decision.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Subscription Cancellation</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold mb-2">2.1 User-Initiated Cancellation</h3>
                <p className="text-white/80 leading-relaxed">
                  You may cancel your subscription at any time through your account settings or by contacting our customer support team. Cancellation will take effect at the end of your current billing period. You will continue to have access to paid features until the end of your billing cycle.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">2.2 Company-Initiated Cancellation</h3>
                <p className="text-white/80 leading-relaxed">
                  We reserve the right to suspend or cancel your subscription immediately if you violate our Terms of Service, engage in fraudulent activity, or fail to make payment. In such cases, no refund will be provided for the remaining subscription period.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">2.3 Auto-Renewal</h3>
                <p className="text-white/80 leading-relaxed">
                  Subscriptions automatically renew at the end of each billing cycle unless canceled before the renewal date. You can disable auto-renewal at any time through your account settings.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Refund Eligibility</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold mb-2">3.1 Refund Window</h3>
                <p className="text-white/80 leading-relaxed">
                  You may request a full refund within <strong>7 days</strong> of your initial purchase or subscription upgrade, provided you have not exceeded reasonable usage limits during this period.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">3.2 Eligibility Criteria</h3>
                <p className="text-white/80 leading-relaxed mb-2">
                  Refunds may be granted if:
                </p>
                <ul className="list-disc list-inside ml-4 space-y-2 text-white/80">
                  <li>The service was not delivered as described</li>
                  <li>Technical issues prevented you from using the service despite our support efforts</li>
                  <li>You were charged incorrectly due to a billing error on our part</li>
                  <li>You meet the refund window requirements (7 days from purchase)</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">3.3 Non-Refundable Items</h3>
                <p className="text-white/80 leading-relaxed mb-2">
                  The following are generally not eligible for refunds:
                </p>
                <ul className="list-disc list-inside ml-4 space-y-2 text-white/80">
                  <li>Subscriptions canceled after the 7-day refund window</li>
                  <li>Partial subscription periods already consumed</li>
                  <li>One-time purchases of add-ons or credits (unless defective or undelivered)</li>
                  <li>Subscriptions terminated due to Terms of Service violations</li>
                  <li>Third-party service fees or taxes</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Refund Process</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold mb-2">4.1 How to Request a Refund</h3>
                <p className="text-white/80 leading-relaxed mb-2">
                  To request a refund:
                </p>
                <ol className="list-decimal list-inside ml-4 space-y-2 text-white/80">
                  <li>Contact our customer support team at support@cortex.com or through your account dashboard</li>
                  <li>Provide your account details and order/subscription information</li>
                  <li>Explain the reason for your refund request</li>
                  <li>Allow up to 5-7 business days for review and processing</li>
                </ol>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">4.2 Refund Review</h3>
                <p className="text-white/80 leading-relaxed">
                  All refund requests are reviewed on a case-by-case basis. We will evaluate your request based on our refund policy, your usage history, and the circumstances of your request. We reserve the right to approve or deny refund requests at our sole discretion.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">4.3 Refund Processing Time</h3>
                <p className="text-white/80 leading-relaxed">
                  Approved refunds will be processed within 5-10 business days. The refund will be credited to the original payment method used for the purchase. Please note that it may take additional time for your bank or credit card company to process the refund and reflect it in your account.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Partial Refunds</h2>
            <p className="text-white/80 leading-relaxed">
              In certain circumstances, we may offer partial refunds for the unused portion of a subscription, calculated on a prorated basis. Partial refunds are provided at our discretion and may be subject to administrative fees.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Chargebacks</h2>
            <p className="text-white/80 leading-relaxed">
              If you initiate a chargeback or dispute a charge without first contacting us to resolve the issue, we reserve the right to suspend or terminate your account. We encourage you to contact us first so we can address any concerns and work toward a resolution.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Special Circumstances</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold mb-2">7.1 Service Downtime</h3>
                <p className="text-white/80 leading-relaxed">
                  In the event of extended service downtime (more than 48 consecutive hours) that prevents you from using the service, we may offer service credits or partial refunds at our discretion.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">7.2 Pricing Errors</h3>
                <p className="text-white/80 leading-relaxed">
                  If you were charged incorrectly due to a pricing error on our website, we will refund the difference or provide a full refund if you prefer to cancel the purchase.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">7.3 Duplicate Charges</h3>
                <p className="text-white/80 leading-relaxed">
                  If you were charged multiple times for the same service, we will immediately refund all duplicate charges upon verification.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Changes to This Policy</h2>
            <p className="text-white/80 leading-relaxed">
              We reserve the right to modify this Cancellation and Refund Policy at any time. Changes will be effective immediately upon posting on this page. Material changes will be communicated to active subscribers via email or through the service interface. Continued use of the service after changes constitutes acceptance of the modified policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Contact Us</h2>
            <p className="text-white/80 leading-relaxed mb-4">
              For questions about cancellations, refunds, or this policy, please contact us at:
            </p>
            <div className="mt-4 p-4 bg-white/5 rounded-lg">
              <p className="text-white/80">
                <strong>Email:</strong> support@cortex.com<br />
                <strong>Refund Requests:</strong> refunds@cortex.com<br />
                <strong>Address:</strong> [Your Company Address]<br />
                <strong>Phone:</strong> [Your Contact Number]<br />
                <strong>Business Hours:</strong> Monday - Friday, 9:00 AM - 6:00 PM [Your Timezone]
              </p>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
