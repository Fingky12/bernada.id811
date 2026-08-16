import { HttpError } from '../lib/http-error.js';

const state = new Map();

function fingerprint(req) {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const path = req.originalUrl || req.url || '/';
  const basePath = path.split('?')[0];
  return `${ip}:${req.method}:${basePath}`;
}

function cleanup(windowMs) {
  const now = Date.now();
  for (const [key, bucket] of state) {
    if (now - bucket.resetAt > windowMs) {
      state.delete(key);
    }
  }
}

export function rateLimit({
  windowMs = 60 * 1000,
  max = 60,
  message = 'Terlalu banyak permintaan, coba lagi nanti.',
} = {}) {
  return (req, res, next) => {
    const key = fingerprint(req);
    const now = Date.now();
    let bucket = state.get(key);

    if (!bucket || now - bucket.resetAt > windowMs) {
      bucket = { count: 0, resetAt: now + windowMs };
      state.set(key, bucket);
    }

    bucket.count += 1;

    res.setHeader('X-RateLimit-Limit', String(max));
    res.setHeader('X-RateLimit-Remaining', String(Math.max(0, max - bucket.count)));
    res.setHeader('X-RateLimit-Reset', String(Math.ceil(bucket.resetAt / 1000)));

    if (bucket.count > max) {
      res.setHeader('Retry-After', String(Math.max(1, Math.ceil((bucket.resetAt - now) / 1000))));
      return next(new HttpError(429, 'RATE_LIMITED', message));
    }

    return next();
  };
}

// Cleanup expired entries (hapus key yang tidak dipakai lagi)
setInterval(() => cleanup(60 * 60 * 1000), 10 * 60 * 1000).unref();
