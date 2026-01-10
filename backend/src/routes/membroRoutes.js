import express from 'express';
import { MembroController } from '../controllers/membroController.js';
import { auth } from '../middlewares/auth.js';
import { checkPermission } from '../middlewares/permissions.js';

const router = express.Router();

router.get('/', auth, checkPermission("membros", "view"), MembroController.listar);
router.post('/', auth, checkPermission("membros", "create"), MembroController.criar);
router.get('/exportar', auth, checkPermission("membros", "view"), MembroController.exportar);
router.get('/:id', auth, checkPermission("membros", "view"), MembroController.buscar);
router.put('/:id', auth, checkPermission("membros", "edit"), MembroController.atualizar);
router.delete('/:id', auth, checkPermission("membros", "delete"), MembroController.deletar);

export default router;