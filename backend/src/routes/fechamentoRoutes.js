import express from 'express';
import { FechamentoController } from '../controllers/fechamentoController.js';
import { auth } from '../middlewares/auth.js';
import { checkPermission } from '../middlewares/permissions.js';

const router = express.Router();

router.get('/', auth, checkPermission("fechamento", "view"), FechamentoController.listar);
router.post('/', auth, checkPermission("fechamento", "create"), FechamentoController.criar);
router.get('/exportar', auth, checkPermission("fechamento", "view"), FechamentoController.exportar);
router.get('/:id', auth, checkPermission("fechamento", "view"), FechamentoController.buscar);
router.put('/:id', auth, checkPermission("fechamento", "edit"), FechamentoController.atualizar);
router.patch('/:id/exportUpdate', auth, checkPermission("fechamento", "edit"), FechamentoController.updateExport);
router.patch('/reset-export', auth, checkPermission('fechamento', 'edit'), FechamentoController.resetExport);
router.delete('/:id', auth, checkPermission("fechamento", "delete"), FechamentoController.deletar);

export default router;