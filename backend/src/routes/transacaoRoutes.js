import express from 'express';
import { TransacaoController } from '../controllers/transacaoController.js';
import { auth } from '../middlewares/auth.js';
import { checkPermission } from '../middlewares/permissions.js';

const router = express.Router();

router.get('/', auth, checkPermission("fluxoDeCaixa", "view"), TransacaoController.listar);
router.get('/resumo', auth, checkPermission("fluxoDeCaixa", "view"), TransacaoController.resumo);
router.post('/', auth, checkPermission("fluxoDeCaixa", "create"), TransacaoController.criar);
router.get('/exportar', auth, checkPermission("fluxoDeCaixa", "view"), TransacaoController.exportar);
router.get('/:id', auth, checkPermission("fluxoDeCaixa", "view"), TransacaoController.buscar);
router.put('/:id', auth, checkPermission("fluxoDeCaixa", "edit"), TransacaoController.atualizar);
router.delete('/:id', auth, checkPermission("fluxoDeCaixa", "delete"), TransacaoController.deletar);

export default router;


