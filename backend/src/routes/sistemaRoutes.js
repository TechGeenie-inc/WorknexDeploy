import { Router } from "express";
import multer from 'multer';
import { SistemaController } from "../controllers/sistemaController.js";
import { somenteAdminMaster } from '../middlewares/somenteAdmMaster.js';
import { auth } from '../middlewares/auth.js';

const upload = multer();
const router = Router();

router.get("/exportar", auth, somenteAdminMaster, SistemaController.exportar);
router.post("/importar", auth, somenteAdminMaster, upload.single("arquivo"), SistemaController.importar);
router.delete("/limpar", auth, somenteAdminMaster, SistemaController.limpar);

export default router;
