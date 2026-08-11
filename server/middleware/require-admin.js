import { requireAuth } from './require-auth.js';
import { getUserById } from '../services/user-service.js';
import { HttpError } from '../lib/http-error.js';

export function requireAdmin(req, res, next) {
  requireAuth(req, res, async (err) => {
    if (err) {
      return next(err);
    }
    const user = await getUserById(req.user.id);
    if (!user || user.role !== 'admin') {
      return next(new HttpError(403, 'FORBIDDEN', 'Akses khusus administrator.'));
    }
    req.user.role = user.role;
    return next();
  });
}
