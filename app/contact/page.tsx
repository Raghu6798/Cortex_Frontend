'use client';

import React, { useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/shadcn/button';
import { Input } from '@/components/ui/shadcn/Input';
import { Textarea } from '@/components/ui/shadcn/textarea';
import { Label } from '@/components/ui/shadcn/label';

export default function ContactUsPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    // Simulate form submission (replace with actual API call)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      // TODO: Implement actual form submission to your backend
      // await fetch('/api/contact', { method: 'POST', body: JSON.stringify(formData) });
      setSubmitStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Header isCompact={false} />
      <main className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Information Section */}
          <div>
            <h1 className="text-4xl font-bold mb-4">Get in Touch</h1>
            <p className="text-white/70 mb-8 text-lg">
              We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>

            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-2">Email</h3>
                <p className="text-white/80">
                  <a href="mailto:support@cortex.com" className="hover:text-white transition-colors">
                    support@cortex.com
                  </a>
                </p>
                <p className="text-white/80 mt-1">
                  <a href="mailto:sales@cortex.com" className="hover:text-white transition-colors">
                    sales@cortex.com
                  </a>
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2">Phone</h3>
                <p className="text-white/80">
                  <a href="tel:+1-XXX-XXX-XXXX" className="hover:text-white transition-colors">
                    +1 (XXX) XXX-XXXX
                  </a>
                </p>
                <p className="text-white/60 text-sm mt-1">Monday - Friday, 9:00 AM - 6:00 PM EST</p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2">Address</h3>
                <p className="text-white/80">
                  [Your Company Address]<br />
                  [City, State ZIP Code]<br />
                  [Country]
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2">Business Hours</h3>
                <p className="text-white/80">
                  Monday - Friday: 9:00 AM - 6:00 PM<br />
                  Saturday: 10:00 AM - 4:00 PM<br />
                  Sunday: Closed
                </p>
              </div>

              <div className="pt-6 border-t border-white/10">
                <h3 className="text-xl font-semibold mb-4">Quick Links</h3>
                <div className="space-y-2">
                  <a href="/privacy" className="block text-white/70 hover:text-white transition-colors">
                    Privacy Policy
                  </a>
                  <a href="/terms" className="block text-white/70 hover:text-white transition-colors">
                    Terms and Conditions
                  </a>
                  <a href="/cancellation-refund" className="block text-white/70 hover:text-white transition-colors">
                    Cancellation and Refund Policy
                  </a>
                  <a href="/shipping-delivery" className="block text-white/70 hover:text-white transition-colors">
                    Shipping and Delivery Policy
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form Section */}
          <div>
            <div className="bg-white/5 rounded-lg p-8 border border-white/10">
              <h2 className="text-2xl font-semibold mb-6">Send us a Message</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="name" className="text-white/90">Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="mt-2 bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    placeholder="Your full name"
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="text-white/90">Email *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="mt-2 bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    placeholder="your.email@example.com"
                  />
                </div>

                <div>
                  <Label htmlFor="subject" className="text-white/90">Subject *</Label>
                  <Input
                    id="subject"
                    name="subject"
                    type="text"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    className="mt-2 bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    placeholder="What is this regarding?"
                  />
                </div>

                <div>
                  <Label htmlFor="message" className="text-white/90">Message *</Label>
                  <Textarea
                    id="message"
                    name="message"
                    required
                    value={formData.message}
                    onChange={handleChange}
                    rows={6}
                    className="mt-2 bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    placeholder="Tell us more about your inquiry..."
                  />
                </div>

                {submitStatus === 'success' && (
                  <div className="p-4 bg-green-500/20 border border-green-500/50 rounded-lg text-green-400">
                    Thank you! Your message has been sent successfully. We'll get back to you soon.
                  </div>
                )}

                {submitStatus === 'error' && (
                  <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400">
                    Something went wrong. Please try again or contact us directly via email.
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-white text-black hover:bg-white/90 disabled:opacity-50"
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </Button>
              </form>

              <p className="text-white/60 text-sm mt-6">
                * Required fields. By submitting this form, you agree to our Privacy Policy and Terms of Service.
              </p>
            </div>
          </div>
        </div>

        {/* Additional Information Section */}
        <div className="mt-16 pt-12 border-t border-white/10">
          <h2 className="text-2xl font-semibold mb-6">Frequently Asked Questions</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white/5 rounded-lg p-6 border border-white/10">
              <h3 className="text-lg font-semibold mb-2">Support Response Time</h3>
              <p className="text-white/70">
                We aim to respond to all inquiries within 24-48 hours during business days. For urgent matters, please call us directly.
              </p>
            </div>
            <div className="bg-white/5 rounded-lg p-6 border border-white/10">
              <h3 className="text-lg font-semibold mb-2">Technical Support</h3>
              <p className="text-white/70">
                For technical issues or integration help, contact our support team or check out our documentation.
              </p>
            </div>
            <div className="bg-white/5 rounded-lg p-6 border border-white/10">
              <h3 className="text-lg font-semibold mb-2">Sales Inquiries</h3>
              <p className="text-white/70">
                Interested in enterprise plans or custom solutions? Our sales team is here to help you find the right fit.
              </p>
            </div>
            <div className="bg-white/5 rounded-lg p-6 border border-white/10">
              <h3 className="text-lg font-semibold mb-2">Partnership Opportunities</h3>
              <p className="text-white/70">
                Looking to partner with us? Reach out to discuss potential collaborations and integrations.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
