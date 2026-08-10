import { Router } from 'express';
import { config } from '../../server/config.js';
import { requireAuth } from '../../server/middleware/require-auth.js';
import { rateLimit } from '../../server/middleware/rate-limit.js';
import {
  validateEmail,
  validatePassword,
  requiredString,
} from '../../server/lib/validation.js';
import * as authService from '../../server/services/auth-service.js';

export const authRouter = Router();

const authLimiter = rateLimit({ windowMs: 60 * 1000, max: 10 });

authRouter.use(authLimiter);

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax',
  path: '/api/auth',
};

function refreshCookieMaxAge() {
  return config.refreshTokenExpiryDays * 24 * 60 * 60 * 1000;
}

function setRefreshCookie(res, token) {
  res.cookie(config.cookieName, token, {
    ...COOKIE_OPTIONS,
    maxAge: refreshCookieMaxAge(),
    secure: config.env === 'production',
  });
}

function clearRefreshCookie(res) {
  res.clearCookie(config.cookieName, COOKIE_OPTIONS);
}

function sendSession(res, session) {
  setRefreshCookie(res, session.refreshToken);
  res.status(200).json({ user: session.user, accessToken: session.accessToken });
}

authRouter.post('/register', async (req, res) => {
  const email = validateEmail(req.body?.email);
  const password = validatePassword(req.body?.password);
  const fullName = requiredString(req.body?.fullName, 'fullName', { max: 100 });

  const session = await authService.register({ email, password, fullName });
  sendSession(res, session);
});

authRouter.post('/login', async (req, res) => {
  const email = validateEmail(req.body?.email);
  const password = validatePassword(req.body?.password);

  const session = await authService.login({ email, password });
  sendSession(res, session);
});

authRouter.post('/refresh', async (req, res) => {
  const session = await authService.refresh(req.cookies?.[config.cookieName]);
  setRefreshCookie(res, session.refreshToken);
  res.status(200).json({ accessToken: session.accessToken });
});

authRouter.post('/logout', async (req, res) => {
  await authService.logout(req.cookies?.[config.cookieName]);
  clearRefreshCookie(res);
  res.status(204).end();
});

authRouter.get('/me', requireAuth, async (req, res) => {
  const user = await authService.getCurrentUser(req.user.id);
  res.status(200).json({ user });
});
