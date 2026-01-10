import express from 'express';
import { ConfigController } from '../controllers/configController.js';
import { auth } from '../middlewares/auth.js';
import { somenteAdminMaster } from '../middlewares/somenteAdmMaster.js';

const router = express.Router();

router.post('/', auth, somenteAdminMaster, ConfigController.atualizar);
router.put('/', auth, somenteAdminMaster, ConfigController.atualizar);
router.get('/', auth, ConfigController.get);

export default router;
