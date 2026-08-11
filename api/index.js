import { Router } from 'express';
import { healthRouter } from './routes/health.js';
import { authRouter } from './routes/auth.js';
import { templatesRouter } from './routes/templates.js';
import { invitationsRouter } from './routes/invitations.js';
import { guestsRouter } from './routes/guests.js';
import { giftAccountsRouter } from './routes/gift-accounts.js';
import { adminRouter } from './routes/admin.js';

export const apiRouter = Router();

apiRouter.use('/health', healthRouter);
apiRouter.use('/auth', authRouter);
apiRouter.use('/templates', templatesRouter);
apiRouter.use('/invitations', invitationsRouter);
apiRouter.use('/admin', adminRouter);
apiRouter.use('/', guestsRouter);
apiRouter.use('/', giftAccountsRouter);
