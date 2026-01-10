import express from 'express';
import { ClienteController } from '../controllers/clienteController.js';
import { checkPermission } from '../middlewares/permissions.js';
import { auth } from '../middlewares/auth.js';

const router = express.Router();

router.get('/', auth, checkPermission("clientes", "view"), ClienteController.listar);
router.get('/exportar', auth, checkPermission("clientes", "view"), ClienteController.exportar);
router.get('/:id', auth, checkPermission("clientes", "view"), ClienteController.buscar);
router.post('/', auth, checkPermission("clientes", "create"), ClienteController.criar);
router.put('/:id', auth, checkPermission("clientes", "edit"), ClienteController.atualizar);
router.delete('/:id', auth, checkPermission("clientes", "delete"), ClienteController.deletar);

export default router;


