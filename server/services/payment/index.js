import { HttpError } from '../../lib/http-error.js';

// Registry provider pembayaran. Provider baru didaftarkan via defineProvider,
// contoh: 'midtrans' | 'xendit' | 'tripay' (PAYMENT PROVIDER DECISION REQUIRED).
const registry = new Map();

export function defineProvider(name, implementation) {
  registry.set(name, { name, ...implementation });
}

export function getProvider(name) {
  const provider = registry.get(name);
  if (!provider) {
    throw new HttpError(
      501,
      'PAYMENT_PROVIDER_NOT_IMPLEMENTED',
      'Provider pembayaran belum tersedia.',
    );
  }
  return provider;
}

defineProvider('manual', {
  // Mode pengembangan: belum ada integrasi provider nyata.
  // Pembayaran dibuat dengan status 'pending'; status 'succeeded' HANYA
  // dapat diubah oleh backend (verifikasi admin manual, M6) — tidak pernah
  // dari request frontend.
  createPayment({ order }) {
    return {
      providerTransactionId: null,
      paymentReference: `MANUAL-${order.orderNumber}`,
      metadata: {
        mode: 'manual',
        note: 'PAYMENT PROVIDER DECISION REQUIRED — belum ada integrasi nyata.',
      },
    };
  },
});
