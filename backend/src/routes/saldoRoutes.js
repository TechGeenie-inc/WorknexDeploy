import express from 'express';
import { SaldoController } from '../controllers/saldoController.js';
import { auth } from '../middlewares/auth.js';
import { checkPermission } from '../middlewares/permissions.js';
 
const router = express.Router();

router.get('/', auth, checkPermission("fluxoDeCaixa", "view"), SaldoController.obter);

export default router;