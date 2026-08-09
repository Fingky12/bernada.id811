import { verifyAccessToken } from '../lib/jwt.js';
import { HttpError } from '../lib/http-error.js';

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return next(new HttpError(401, 'UNAUTHORIZED', 'Anda belum masuk.'));
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub };
    return next();
  } catch {
    return next(new HttpError(401, 'UNAUTHORIZED', 'Sesi tidak valid atau kedaluwarsa.'));
  }
}
