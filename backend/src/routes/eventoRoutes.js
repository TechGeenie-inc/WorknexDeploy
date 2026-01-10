import express from 'express';
import { EventoController } from '../controllers/eventoController.js';
import { auth } from '../middlewares/auth.js';
import { checkPermission } from '../middlewares/permissions.js';

const router = express.Router();

router.get('/', auth, checkPermission("agenda", "view"), EventoController.listar);
router.get('/:id', auth, checkPermission("agenda", "view"), EventoController.buscar);
router.post('/', auth, checkPermission("agenda", "create"), EventoController.criar);
router.put('/:id', auth, checkPermission("agenda", "edit"), EventoController.atualizar);
router.delete('/:id', auth, checkPermission("agenda", "delete"), EventoController.deletar);

export default router;


