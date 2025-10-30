import { loadStripe, type Stripe } from '@stripe/stripe-js';

const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string | undefined;

if (!publishableKey) {
  console.warn(
    '[Stripe] Missing VITE_STRIPE_PUBLISHABLE_KEY. Stripe Elements will not initialize.'
  );
}

const stripePromise: Promise<Stripe | null> | null = publishableKey
  ? loadStripe(publishableKey)
  : null;

export { stripePromise };
