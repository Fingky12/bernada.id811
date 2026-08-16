import { Router } from 'express';
import { parseId } from '../../server/lib/validation.js';
import * as packageService from '../../server/services/package-service.js';

export const packagesRouter = Router();

packagesRouter.get('/', async (req, res) => {
  const packages = await packageService.listActivePackages();
  res.status(200).json({ packages });
});

packagesRouter.get('/:id', async (req, res) => {
  const id = parseId(req.params.id);
  const pkg = await packageService.getActivePackageById(id);
  res.status(200).json({ package: pkg });
});
