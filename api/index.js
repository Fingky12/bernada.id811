import { Router } from 'express';
import { healthRouter } from './routes/health.js';

export const apiRouter = Router();

apiRouter.use('/health', healthRouter);
