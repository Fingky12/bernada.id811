import { Router } from 'express';
import { healthRouter } from './routes/health.js';
import { authRouter } from './routes/auth.js';
import { templatesRouter } from './routes/templates.js';
import { packagesRouter } from './routes/packages.js';
import { ordersRouter } from './routes/orders.js';
import { invitationsRouter } from './routes/invitations.js';
import { guestsRouter } from './routes/guests.js';
import { giftAccountsRouter } from './routes/gift-accounts.js';
import { uploadsRouter } from './routes/uploads.js';
import { adminRouter } from './routes/admin.js';

export const apiRouter = Router();

apiRouter.use('/health', healthRouter);
apiRouter.use('/auth', authRouter);
apiRouter.use('/templates', templatesRouter);
apiRouter.use('/packages', packagesRouter);
apiRouter.use('/orders', ordersRouter);
  apiRouter.use('/invitations', invitationsRouter);
  apiRouter.use('/uploads', uploadsRouter);
  apiRouter.use('/admin', adminRouter);
apiRouter.use('/', guestsRouter);
apiRouter.use('/', giftAccountsRouter);
