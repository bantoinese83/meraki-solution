import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, CreditCard, Database, Star, Users, Shield, Activity } from 'lucide-react';
import { AnimatedShinyText } from '@/components/magicui/animated-shiny-text';
import { AuroraText } from '@/components/magicui/aurora-text';
import { SparklesText } from '@/components/magicui/sparkles-text';
import { BoxReveal } from '@/components/magicui/box-reveal';
// import FeaturesBentoGrid from './hero-bento';

const testimonials = [
  {
    name: 'Alex P.',
    company: 'Freelance Designer',
    quote: '“Meraki Solution made invoicing effortless and helped me get paid faster!”',
    avatar: <Users className="h-8 w-8 text-orange-400" />,
  },
  {
    name: 'Taylor S.',
    company: 'Small Business Owner',
    quote: '“The dashboard is beautiful and the payment tracking is a game changer.”',
    avatar: <Users className="h-8 w-8 text-orange-400" />,
  },
];

export default function HomePage() {
  return (
    <main>
      {/* Hero + Image Section */}
      <section className="flex flex-col lg:flex-row items-center justify-center min-h-[80vh] max-w-7xl mx-auto px-4 py-20 gap-12 relative overflow-hidden">
        {/* Animated Gradient Background */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute left-1/2 top-1/3 -translate-x-1/2 w-[60vw] h-[60vw] bg-gradient-to-br from-orange-200 via-orange-100 to-white rounded-full blur-3xl opacity-60 animate-pulse" />
        </div>
        {/* Hero Section */}
        <div className="flex-1 max-w-xl w-full z-10">
          <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight sm:text-6xl md:text-7xl leading-tight">
            <AnimatedShinyText shimmerWidth={120} className="inline-block">Simplify Your Invoicing</AnimatedShinyText>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-orange-400 to-orange-600">
              <AuroraText>with Meraki Solution</AuroraText>
            </span>
          </h1>
          <p className="mt-5 text-lg text-gray-600 sm:text-xl lg:text-lg xl:text-xl">
            Meraki Solution eliminates the hassle of traditional billing methods. Create
            professional invoices, automate reminders, and get paid faster—all in one place.
          </p>
          <div className="mt-8 flex gap-4">
            <a href="/sign-up">
              <Button
                size="lg"
                variant="default"
                className="text-lg rounded-full bg-orange-500 hover:bg-orange-600 text-white shadow-lg"
              >
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </a>
            <a href="/pricing">
              <Button
                size="lg"
                variant="outline"
                className="text-lg rounded-full border-orange-400 text-orange-500 hover:bg-orange-50"
              >
                See Pricing
              </Button>
            </a>
          </div>
          {/* Trust Bar */}
          <div className="mt-8 flex items-center gap-2 text-sm text-gray-500">
            <SparklesText className="inline-flex items-center gap-2 text-orange-500 font-semibold">
              <Star className="h-5 w-5 text-orange-400 mr-1" />
              Trusted by 1,000+ businesses
            </SparklesText>
          </div>
        </div>
        {/* Stock Image */}
        <div className="flex-1 w-full max-w-2xl z-10 flex items-center justify-center">
          <img
            src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80"
            alt="Business team working on invoices"
            className="rounded-3xl shadow-xl object-cover w-full h-[340px] lg:h-[420px] border border-orange-100 bg-white"
            loading="lazy"
          />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <BoxReveal boxColor="#fb923c" duration={0.7}>
            <h2 className="text-3xl font-extrabold text-center mb-12">Why Meraki?</h2>
          </BoxReveal>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Unlimited Invoices */}
            <div>
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-orange-500 text-white">
                <CreditCard className="h-6 w-6" />
              </div>
              <div className="mt-5">
                <h2 className="text-lg font-semibold text-gray-900">Unlimited Invoices</h2>
                <p className="mt-2 text-base text-gray-500">
                  Create and send unlimited professional invoices to your clients.
                </p>
              </div>
            </div>
            {/* Automated Reminders */}
            <div>
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-orange-500 text-white">
                <Database className="h-6 w-6" />
              </div>
              <div className="mt-5">
                <h2 className="text-lg font-semibold text-gray-900">Automated Reminders</h2>
                <p className="mt-2 text-base text-gray-500">
                  Send automatic payment reminders and follow-ups to clients.
                </p>
              </div>
            </div>
            {/* Real-Time Payment Tracking */}
            <div>
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-orange-500 text-white">
                <Star className="h-6 w-6" />
              </div>
              <div className="mt-5">
                <h2 className="text-lg font-semibold text-gray-900">Real-Time Payment Tracking</h2>
                <p className="mt-2 text-base text-gray-500">
                  Monitor invoice status and get notified when payments are received.
                </p>
              </div>
            </div>
            {/* Online Payments */}
            <div>
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-orange-500 text-white">
                <CreditCard className="h-6 w-6" />
              </div>
              <div className="mt-5">
                <h2 className="text-lg font-semibold text-gray-900">Online Payments</h2>
                <p className="mt-2 text-base text-gray-500">
                  Accept payments online with integrated payment gateways.
                </p>
              </div>
            </div>
            {/* Financial Reports */}
            <div>
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-orange-500 text-white">
                <Database className="h-6 w-6" />
              </div>
              <div className="mt-5">
                <h2 className="text-lg font-semibold text-gray-900">Financial Reports</h2>
                <p className="mt-2 text-base text-gray-500">
                  Generate basic and advanced financial reports to analyze your business.
                </p>
              </div>
            </div>
            {/* Client Management */}
            <div>
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-orange-500 text-white">
                <Users className="h-6 w-6" />
              </div>
              <div className="mt-5">
                <h2 className="text-lg font-semibold text-gray-900">Client Management</h2>
                <p className="mt-2 text-base text-gray-500">
                  Manage all your clients in one place, with unlimited clients on Pro.
                </p>
              </div>
            </div>
            {/* Custom Invoice Templates */}
            <div>
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-orange-500 text-white">
                <Star className="h-6 w-6" />
              </div>
              <div className="mt-5">
                <h2 className="text-lg font-semibold text-gray-900">Custom Invoice Templates</h2>
                <p className="mt-2 text-base text-gray-500">
                  Personalize your invoices with custom templates (Pro).
                </p>
              </div>
            </div>
            {/* Team Management */}
            <div>
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-orange-500 text-white">
                <Users className="h-6 w-6" />
              </div>
              <div className="mt-5">
                <h2 className="text-lg font-semibold text-gray-900">Team Management</h2>
                <p className="mt-2 text-base text-gray-500">
                  Invite, remove, and manage team members with roles and permissions.
                </p>
              </div>
            </div>
            {/* Expense Tracking */}
            <div>
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-orange-500 text-white">
                <Database className="h-6 w-6" />
              </div>
              <div className="mt-5">
                <h2 className="text-lg font-semibold text-gray-900">Expense Tracking</h2>
                <p className="mt-2 text-base text-gray-500">
                  Track and categorize business expenses for better financial control.
                </p>
              </div>
            </div>
            {/* Time Tracking */}
            <div>
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-orange-500 text-white">
                <Database className="h-6 w-6" />
              </div>
              <div className="mt-5">
                <h2 className="text-lg font-semibold text-gray-900">Time Tracking</h2>
                <p className="mt-2 text-base text-gray-500">
                  Log billable hours and track time spent on projects.
                </p>
              </div>
            </div>
            {/* Security Settings */}
            <div>
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-orange-500 text-white">
                <Shield className="h-6 w-6" />
              </div>
              <div className="mt-5">
                <h2 className="text-lg font-semibold text-gray-900">Security Settings</h2>
                <p className="mt-2 text-base text-gray-500">
                  Manage your account security, change password, and delete account securely.
                </p>
              </div>
            </div>
            {/* Activity Log */}
            <div>
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-orange-500 text-white">
                <Activity className="h-6 w-6" />
              </div>
              <div className="mt-5">
                <h2 className="text-lg font-semibold text-gray-900">Activity Log</h2>
                <p className="mt-2 text-base text-gray-500">
                  View a detailed audit trail of all important account and team actions.
                </p>
              </div>
            </div>
            {/* Priority Support */}
            <div>
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-orange-500 text-white">
                <Star className="h-6 w-6" />
              </div>
              <div className="mt-5">
                <h2 className="text-lg font-semibold text-gray-900">Priority Support</h2>
                <p className="mt-2 text-base text-gray-500">
                  Get fast, dedicated support with the Pro plan.
                </p>
              </div>
            </div>
            {/* Subscription Management */}
            <div>
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-orange-500 text-white">
                <CreditCard className="h-6 w-6" />
              </div>
              <div className="mt-5">
                <h2 className="text-lg font-semibold text-gray-900">Subscription Management</h2>
                <p className="mt-2 text-base text-gray-500">
                  Easily manage your subscription and billing from your dashboard.
                </p>
              </div>
            </div>
            {/* Dashboard Analytics */}
            <div>
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-orange-500 text-white">
                <Database className="h-6 w-6" />
              </div>
              <div className="mt-5">
                <h2 className="text-lg font-semibold text-gray-900">Dashboard Analytics</h2>
                <p className="mt-2 text-base text-gray-500">
                  Visualize revenue, outstanding payments, top clients, and AI-powered insights.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-12 bg-gradient-to-r from-orange-50 via-white to-orange-100">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((t, i) => (
              <div
                key={i}
                className="rounded-2xl bg-white shadow-lg p-8 flex flex-col items-center text-center border border-orange-100"
              >
                <div className="mb-4">{t.avatar}</div>
                <blockquote className="text-lg italic text-gray-700">{t.quote}</blockquote>
                <div className="mt-4 font-semibold text-orange-600">{t.name}</div>
                <div className="text-xs text-gray-400">{t.company}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-orange-500 via-orange-400 to-orange-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h2 className="text-3xl font-bold sm:text-4xl mb-2">
              Ready to streamline your billing?
            </h2>
            <p className="max-w-2xl text-lg opacity-90">
              Meraki Solution provides everything you need to manage invoices, payments, and clients
              efficiently. Focus on growing your business while we handle the billing.
            </p>
          </div>
          <a href="/sign-up">
            <Button
              size="lg"
              variant="default"
              className="text-lg rounded-full bg-white text-orange-600 hover:bg-orange-50 shadow-lg"
            >
              Try Meraki Solution
              <ArrowRight className="ml-3 h-6 w-6" />
            </Button>
          </a>
        </div>
      </section>
    </main>
  );
}
