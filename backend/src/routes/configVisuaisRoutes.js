import express from 'express';
import { ConfigVisualController } from '../controllers/configVisualController.js';
import { auth } from '../middlewares/auth.js';
import { somenteAdminMaster } from '../middlewares/somenteAdmMaster.js';

const router = express.Router();

router.get('/', auth, ConfigVisualController.get);

router.put('/', auth, somenteAdminMaster, ConfigVisualController.atualizar);

export default router;