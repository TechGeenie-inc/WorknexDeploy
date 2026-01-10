import express from 'express';
import { AuthController } from '../controllers/authController.js';
import { auth } from '../middlewares/auth.js';
import { checkPermission } from '../middlewares/permissions.js';

const router = express.Router();

router.post('/signup', auth, checkPermission("configuracoes", "create"), AuthController.signup);
router.post('/login', AuthController.login);
router.get('/me', auth, AuthController.me);
router.get('/check-email', AuthController.checkEmail);

router.put('/toggle2fa', auth, AuthController.toggle2FA);
router.post('/verificar2fa', AuthController.verificar2FA);
router.put('/reativar/:id', auth, checkPermission("configuracoes", "edit"), AuthController.reativar);

router.get('/:id', auth, checkPermission("configuracoes", "view"), AuthController.buscarPorId);
router.get('/', auth, checkPermission("configuracoes", "view"), AuthController.listar);
router.put('/:id', auth, checkPermission("configuracoes", "edit"), AuthController.atualizar);
router.delete('/desativar/:id', auth, checkPermission("configuracoes", "delete"), AuthController.desativar);
router.delete('/:id', auth, checkPermission("configuracoes", "delete"), AuthController.deletar);



export default router;
