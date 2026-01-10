import express from 'express';
import { EquipeController } from '../controllers/equipeController.js';
import { auth } from '../middlewares/auth.js';
import { checkPermission } from '../middlewares/permissions.js';

const router = express.Router();

router.get('/', auth, checkPermission("equipes", "view"), EquipeController.listar);
router.post('/', auth, checkPermission("equipes", "create"), EquipeController.criar);
router.get('/exportar', auth, checkPermission("equipes", "view"), EquipeController.exportar);
router.get('/:id', auth, checkPermission("equipes", "view"), EquipeController.buscar);
router.put('/:id', auth, checkPermission("equipes", "edit"), EquipeController.atualizar);
router.put('/:id/status', auth, checkPermission("equipes", "edit"), EquipeController.atualizarStatus);
router.delete('/:id', auth, checkPermission("equipes", "delete"), EquipeController.deletar);

export default router;