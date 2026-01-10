import express from 'express';
import { FuncaoController } from '../controllers/funcaoController.js';
import { auth } from '../middlewares/auth.js';
import { checkPermission } from '../middlewares/permissions.js';

const router = express.Router();

router.get('/', auth, checkPermission("funcoes", "view"), FuncaoController.listar);
router.get('/exportar', auth, checkPermission("funcoes", "view"), FuncaoController.exportar);
router.post('/', auth, checkPermission("funcoes", "create"), FuncaoController.criar);
router.get('/:id', auth, checkPermission("funcoes", "view"), FuncaoController.buscar);
router.put('/:id', auth, checkPermission("funcoes", "edit"), FuncaoController.atualizar);
router.delete('/:id', auth, checkPermission("funcoes", "delete"), FuncaoController.deletar);

export default router;