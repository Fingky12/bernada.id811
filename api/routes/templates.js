import { Router } from 'express';
import * as templateService from '../../server/services/template-service.js';

export const templatesRouter = Router();

templatesRouter.get('/', async (req, res) => {
  const templates = await templateService.listActiveTemplates();
  res.status(200).json({ templates });
});
