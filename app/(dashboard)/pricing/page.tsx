import React from 'react';
import { checkoutAction } from '@/lib/payments/actions';
import { Check } from 'lucide-react';
import { getStripePrices, getStripeProducts } from '@/lib/payments/stripe';
import { SubmitButton } from './submit-button';
import { AnimatedGradientText } from '@/components/magicui/animated-gradient-text';
import { Meteors } from '@/components/magicui/meteors';

// Prices are fresh for one hour max
export const revalidate = 3600;

export default async function PricingPage() {
  const [prices, products] = await Promise.all([getStripePrices(), getStripeProducts()]);

  const starterPlan = products.find((product: { name: string }) => product.name === 'Starter');
  const proPlan = products.find((product: { name: string }) => product.name === 'Pro');

  const starterPrice = prices.find(
    (price: { productId: string }) => price.productId === starterPlan?.id,
  );
  const proPrice = prices.find((price: { productId: string }) => price.productId === proPlan?.id);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <AnimatedGradientText speed={2} colorFrom="#fb923c" colorTo="#f472b6" className="text-5xl font-extrabold tracking-tight mb-2">
          Simple, Transparent Pricing
        </AnimatedGradientText>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Choose the plan that fits your business. No hidden fees, no surprises. Upgrade or cancel anytime.
        </p>
      </div>
      <div className="grid md:grid-cols-2 gap-10 max-w-3xl mx-auto">
        <PricingCard
          name={starterPlan?.name || 'Starter'}
          price={starterPrice?.unitAmount || 800}
          interval={starterPrice?.interval || 'month'}
          trialDays={starterPrice?.trialPeriodDays || 7}
          features={[
            'Create unlimited invoices',
            'Automated payment reminders',
            'Track payment status',
            'Basic financial reports',
            'Manage up to 50 clients',
          ]}
          priceId={starterPrice?.id}
          highlight={false}
        />
        <PricingCard
          name={proPlan?.name || 'Pro'}
          price={proPrice?.unitAmount || 1200}
          interval={proPrice?.interval || 'month'}
          trialDays={proPrice?.trialPeriodDays || 7}
          features={[
            'Everything in Starter, plus:',
            'Advanced financial reports',
            'Unlimited clients',
            'Custom invoice templates',
            'Priority support',
            'Online payment integrations',
          ]}
          priceId={proPrice?.id}
          highlight={true}
        />
      </div>
    </main>
  );
}

function PricingCard({
  name,
  price,
  interval,
  trialDays,
  features,
  priceId,
  highlight = false,
}: {
  name: string;
  price: number;
  interval: string;
  trialDays: number;
  features: string[];
  priceId?: string;
  highlight?: boolean;
}) {
  return (
    <div className={`relative rounded-3xl shadow-xl overflow-hidden bg-white/90 border border-orange-100 p-8 flex flex-col items-center transition-transform duration-300 hover:scale-[1.025] ${highlight ? 'ring-2 ring-orange-400 z-10' : ''}`}>
      <Meteors number={8} />
      <div className="relative z-10 w-full flex flex-col items-center">
        <AnimatedGradientText speed={2} colorFrom="#fb923c" colorTo="#f472b6" className="text-3xl font-bold mb-1">
          {name}
        </AnimatedGradientText>
        <p className="text-sm text-gray-500 mb-4">{trialDays} day free trial</p>
        <p className="text-5xl font-extrabold text-gray-900 mb-6">
          ${price / 100}{' '}
          <span className="text-xl font-normal text-gray-600">/ {interval}</span>
        </p>
        <ul className="space-y-4 mb-8 w-full">
          {features.map((feature: string, index: number) => (
            <li key={index} className="flex items-start">
              <Check className="h-5 w-5 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
              <span className="text-gray-700">{feature}</span>
            </li>
          ))}
        </ul>
        <form action={checkoutAction} className="w-full">
          <input type="hidden" name="priceId" value={priceId} />
          <SubmitButton className={`w-full py-3 rounded-full text-lg font-semibold shadow-md ${highlight ? 'bg-gradient-to-r from-orange-400 via-orange-500 to-pink-400 text-white hover:from-orange-500 hover:to-pink-500' : 'bg-white text-orange-600 border border-orange-200 hover:bg-orange-50'}`} />
        </form>
      </div>
      {highlight && (
        <span className="absolute top-4 right-4 bg-orange-400 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg z-20 animate-bounce">Most Popular</span>
      )}
    </div>
  );
}
