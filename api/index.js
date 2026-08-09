import { Router } from 'express';
import { healthRouter } from './routes/health.js';
import { authRouter } from './routes/auth.js';
import { templatesRouter } from './routes/templates.js';
import { invitationsRouter } from './routes/invitations.js';

export const apiRouter = Router();

apiRouter.use('/health', healthRouter);
apiRouter.use('/auth', authRouter);
apiRouter.use('/templates', templatesRouter);
apiRouter.use('/invitations', invitationsRouter);
