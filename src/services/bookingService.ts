import { BookingConfirmation, PassengerDetails, PaymentMethodId, SelectedFare } from '../types';

/**
 * Mock checkout — intentionally NOT a real payment integration.
 *
 * The case brief explicitly does not expect production-grade payments.
 * Wiring a real PSP (Stripe/iyzico) into a take-home case would mean
 * handling real card data, PCI scope, sandbox keys and refund flows for
 * zero product-decision value. Instead this simulates the network round
 * trip (latency + a small deterministic failure rate to exercise the
 * error state) and returns a fake PNR. See README -> Security &
 * Production Considerations for what a real implementation needs.
 */

function randomPnr(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = '';
  for (let i = 0; i < 6; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export async function submitBooking(
  selection: SelectedFare,
  passenger: PassengerDetails,
  paymentMethod: PaymentMethodId,
  totalPaid: number,
  currency: string
): Promise<BookingConfirmation> {
  // Simulate a realistic checkout round-trip.
  await new Promise((resolve) => setTimeout(resolve, 1400));

  // Small deterministic-ish failure rate so the UI's error state is
  // reachable during a demo, rather than only existing in theory.
  if (Math.random() < 0.08) {
    throw new Error('PAYMENT_DECLINED');
  }

  return {
    pnr: randomPnr(),
    createdAt: new Date().toISOString(),
    selection,
    passenger,
    totalPaid,
    currency,
  };
}
