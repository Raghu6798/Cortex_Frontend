'use client';

import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function ShippingDeliveryPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Header isCompact={false} />
      <main className="mx-auto max-w-4xl px-6 py-16">
        <h1 className="text-4xl font-bold mb-8">Shipping and Delivery Policy</h1>
        <p className="text-white/70 mb-8">Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

        <div className="prose prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
            <p className="text-white/80 leading-relaxed">
              Cortex provides digital services and software products. This Shipping and Delivery Policy outlines how digital products and services are delivered to our customers. As we primarily offer software and cloud-based services, most deliveries are instant and digital.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Digital Product Delivery</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold mb-2">2.1 Instant Digital Access</h3>
                <p className="text-white/80 leading-relaxed">
                  Upon successful payment and account activation, you will receive immediate access to:
                </p>
                <ul className="list-disc list-inside ml-4 space-y-2 text-white/80">
                  <li>Agent Development Environment (ADE) platform</li>
                  <li>Account dashboard and user interface</li>
                  <li>API access and documentation</li>
                  <li>All subscribed features and services</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">2.2 Access Credentials</h3>
                <p className="text-white/80 leading-relaxed">
                  Account credentials and access information will be sent to the email address associated with your account registration. If you do not receive access information within 24 hours of purchase, please contact our support team.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">2.3 Account Activation</h3>
                <p className="text-white/80 leading-relaxed">
                  Service activation typically occurs immediately upon successful payment verification. In rare cases, activation may take up to 24 hours for manual review or verification purposes.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Service Availability</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold mb-2">3.1 Service Status</h3>
                <p className="text-white/80 leading-relaxed">
                  Our services are available 24/7 through cloud-based infrastructure. Service availability is maintained at 99.9% uptime (subject to scheduled maintenance and force majeure events).
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">3.2 Maintenance Windows</h3>
                <p className="text-white/80 leading-relaxed">
                  Scheduled maintenance will be announced in advance through email notifications and service status updates. We strive to minimize maintenance windows and conduct them during off-peak hours when possible.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">3.3 Geographic Availability</h3>
                <p className="text-white/80 leading-relaxed">
                  Our services are accessible globally via the internet. However, certain features or services may be subject to regional restrictions based on local laws and regulations. We will notify you if any restrictions apply to your region.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Software Updates and Deliveries</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold mb-2">4.1 Automatic Updates</h3>
                <p className="text-white/80 leading-relaxed">
                  Platform updates, security patches, and feature enhancements are automatically delivered to all active accounts. No action is required from users to receive these updates.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">4.2 Major Version Releases</h3>
                <p className="text-white/80 leading-relaxed">
                  Major version releases and significant feature updates will be communicated via email and in-platform notifications. Users will be informed of new features, changes, and any action items required.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">4.3 Documentation Updates</h3>
                <p className="text-white/80 leading-relaxed">
                  Documentation, API references, and user guides are continuously updated and available online. Updated documentation is immediately accessible through our documentation portal.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Subscription Service Delivery</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold mb-2">5.1 Subscription Activation</h3>
                <p className="text-white/80 leading-relaxed">
                  Subscription services become active immediately upon payment confirmation. Your billing cycle begins on the date of purchase, and you will have immediate access to all subscribed features.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">5.2 Service Continuity</h3>
                <p className="text-white/80 leading-relaxed">
                  As long as your subscription remains active and payments are current, you will have uninterrupted access to the service. Service will automatically renew at the end of each billing period unless canceled.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">5.3 Upgrade/Downgrade Delivery</h3>
                <p className="text-white/80 leading-relaxed">
                  Plan upgrades take effect immediately. Plan downgrades take effect at the end of your current billing cycle. All changes are reflected in your account dashboard in real-time.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. API and Integration Access</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold mb-2">6.1 API Keys</h3>
                <p className="text-white/80 leading-relaxed">
                  API keys and integration credentials are generated immediately upon account creation and are available through your account dashboard. API documentation is accessible online at all times.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">6.2 Integration Support</h3>
                <p className="text-white/80 leading-relaxed">
                  Integration documentation, code samples, and SDKs are available immediately upon account activation. Our support team is available to assist with integration setup during business hours.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Email Notifications</h2>
            <p className="text-white/80 leading-relaxed">
              Important account notifications, service updates, and delivery confirmations are sent to the email address associated with your account. Please ensure your email address is current and that you check your spam folder if you do not receive expected communications.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Delivery Issues</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold mb-2">8.1 Access Problems</h3>
                <p className="text-white/80 leading-relaxed">
                  If you do not receive access to the service within 24 hours of purchase, or if you experience any delivery-related issues, please contact our support team immediately. We will investigate and resolve the issue promptly.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">8.2 Email Delivery Failures</h3>
                <p className="text-white/80 leading-relaxed">
                  If you do not receive account activation emails or service notifications, please check your spam folder and verify your email address in your account settings. You can request a resend of any missing communications through our support team.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Physical Products (If Applicable)</h2>
            <p className="text-white/80 leading-relaxed mb-4">
              Currently, Cortex does not ship physical products. If this changes in the future, this policy will be updated with shipping information, delivery times, and tracking details for physical goods.
            </p>
            <p className="text-white/80 leading-relaxed">
              For any future physical product shipments, standard shipping terms and delivery estimates will be provided at checkout, and tracking information will be sent via email.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. International Access</h2>
            <p className="text-white/80 leading-relaxed">
              Our digital services are available internationally. Users from any country with internet access can use our platform. However, users are responsible for ensuring their use of our services complies with local laws and regulations in their jurisdiction.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">11. Service Level Agreement (SLA)</h2>
            <p className="text-white/80 leading-relaxed">
              We commit to maintaining service availability as outlined in our Terms of Service. Service delivery and availability are governed by our SLA, which guarantees 99.9% uptime for paid subscriptions, excluding scheduled maintenance windows.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">12. Changes to Delivery Policy</h2>
            <p className="text-white/80 leading-relaxed">
              We reserve the right to modify this Shipping and Delivery Policy at any time. Changes will be effective immediately upon posting. Material changes will be communicated to active users via email or platform notifications.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">13. Contact Us</h2>
            <p className="text-white/80 leading-relaxed mb-4">
              For questions about service delivery, access issues, or this policy, please contact us at:
            </p>
            <div className="mt-4 p-4 bg-white/5 rounded-lg">
              <p className="text-white/80">
                <strong>Email:</strong> support@cortex.com<br />
                <strong>Delivery Issues:</strong> delivery@cortex.com<br />
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
