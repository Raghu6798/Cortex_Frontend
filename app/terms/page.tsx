'use client';

import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function TermsAndConditionsPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Header isCompact={false} />
      <main className="mx-auto max-w-4xl px-6 py-16">
        <h1 className="text-4xl font-bold mb-8">Terms and Conditions</h1>
        <p className="text-white/70 mb-8">Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

        <div className="prose prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Agreement to Terms</h2>
            <p className="text-white/80 leading-relaxed">
              By accessing and using Cortex ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
            <p className="text-white/80 leading-relaxed">
              Cortex is an Agent Development Environment (ADE) platform that provides tools and services for building, testing, and deploying AI agents. Our services include but are not limited to LLM context management, persistent memory, multimodal chat capabilities, agent configuration, and observability tools.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold mb-2">3.1 Account Registration</h3>
                <p className="text-white/80 leading-relaxed">
                  To access certain features of the Service, you must register for an account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">3.2 Account Security</h3>
                <p className="text-white/80 leading-relaxed">
                  You are responsible for safeguarding your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">3.3 Account Termination</h3>
                <p className="text-white/80 leading-relaxed">
                  We reserve the right to suspend or terminate your account at any time, with or without notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Acceptable Use</h2>
            <p className="text-white/80 leading-relaxed mb-4">
              You agree not to use the Service:
            </p>
            <ul className="list-disc list-inside ml-4 space-y-2 text-white/80">
              <li>For any unlawful purpose or to solicit others to perform unlawful acts</li>
              <li>To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
              <li>To infringe upon or violate our intellectual property rights or the intellectual property rights of others</li>
              <li>To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
              <li>To submit false or misleading information</li>
              <li>To upload or transmit viruses or any other type of malicious code</li>
              <li>To collect or track the personal information of others</li>
              <li>To spam, phish, pharm, pretext, spider, crawl, or scrape</li>
              <li>For any obscene or immoral purpose</li>
              <li>To interfere with or circumvent the security features of the Service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Payment Terms</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold mb-2">5.1 Pricing</h3>
                <p className="text-white/80 leading-relaxed">
                  Pricing for our services is displayed on our website and may be subject to change. We reserve the right to modify pricing at any time, but changes will not affect active subscriptions during their billing period.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">5.2 Billing</h3>
                <p className="text-white/80 leading-relaxed">
                  Payment is processed through secure third-party payment processors. By providing payment information, you agree that we may charge all fees incurred through your account to any payment method provided.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">5.3 Refunds</h3>
                <p className="text-white/80 leading-relaxed">
                  Refund policies are governed by our Cancellation and Refund Policy. Please refer to that document for detailed information about refund eligibility and procedures.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Intellectual Property Rights</h2>
            <p className="text-white/80 leading-relaxed mb-4">
              The Service and its original content, features, and functionality are and will remain the exclusive property of Cortex and its licensors. The Service is protected by copyright, trademark, and other laws. Our trademarks and trade dress may not be used in connection with any product or service without our prior written consent.
            </p>
            <p className="text-white/80 leading-relaxed">
              You retain ownership of any content you create using our Service. However, by using the Service, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, and distribute your content solely for the purpose of providing and improving the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Service Availability</h2>
            <p className="text-white/80 leading-relaxed">
              We strive to ensure the Service is available 24/7, but we do not guarantee uninterrupted access. The Service may be temporarily unavailable due to maintenance, updates, or circumstances beyond our control. We are not liable for any damages resulting from service interruptions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Limitation of Liability</h2>
            <p className="text-white/80 leading-relaxed">
              To the fullest extent permitted by applicable law, Cortex shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses resulting from your use of the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Indemnification</h2>
            <p className="text-white/80 leading-relaxed">
              You agree to defend, indemnify, and hold harmless Cortex and its officers, directors, employees, and agents from and against any claims, liabilities, damages, losses, and expenses, including reasonable attorney's fees, arising out of or in any way connected with your access to or use of the Service or violation of these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. Disclaimer of Warranties</h2>
            <p className="text-white/80 leading-relaxed">
              The Service is provided on an "AS IS" and "AS AVAILABLE" basis without any warranties of any kind, either express or implied. We do not warrant that the Service will be uninterrupted, secure, or error-free.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">11. Governing Law</h2>
            <p className="text-white/80 leading-relaxed">
              These Terms shall be governed by and construed in accordance with the laws of [Your Jurisdiction], without regard to its conflict of law provisions. Any disputes arising under or in connection with these Terms shall be subject to the exclusive jurisdiction of the courts of [Your Jurisdiction].
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">12. Changes to Terms</h2>
            <p className="text-white/80 leading-relaxed">
              We reserve the right to modify these Terms at any time. We will notify users of any material changes by posting the updated Terms on this page and updating the "Last Updated" date. Your continued use of the Service after such changes constitutes acceptance of the modified Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">13. Severability</h2>
            <p className="text-white/80 leading-relaxed">
              If any provision of these Terms is found to be unenforceable or invalid, that provision shall be limited or eliminated to the minimum extent necessary, and the remaining provisions shall remain in full force and effect.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">14. Contact Information</h2>
            <p className="text-white/80 leading-relaxed mb-4">
              If you have any questions about these Terms and Conditions, please contact us at:
            </p>
            <div className="mt-4 p-4 bg-white/5 rounded-lg">
              <p className="text-white/80">
                <strong>Email:</strong> legal@cortex.com<br />
                <strong>Address:</strong> [Your Company Address]<br />
                <strong>Phone:</strong> [Your Contact Number]
              </p>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
