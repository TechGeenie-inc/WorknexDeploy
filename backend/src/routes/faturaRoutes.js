import express from 'express';
import { FaturaController } from '../controllers/faturaController.js';
import { auth } from '../middlewares/auth.js';
import { checkPermission } from '../middlewares/permissions.js';

const router = express.Router();

router.get('/', auth, checkPermission("faturamento", "view"), FaturaController.listar);
router.post('/', auth, checkPermission("faturamento", "create"), FaturaController.criar);
router.get('/exportar', auth, checkPermission("faturamento", "view"), FaturaController.exportar);
router.get('/:id', auth, checkPermission("faturamento", "view"), FaturaController.buscar);
router.put('/:id', auth, checkPermission("faturamento", "edit"), FaturaController.atualizar);
router.put('/:id/status', auth, checkPermission("faturamento", "edit"), FaturaController.atualizarStatus);
router.delete('/:id', auth, checkPermission("faturamento", "delete"), FaturaController.deletar);

export default router;


