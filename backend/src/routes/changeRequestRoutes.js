import express from "express";
import { ChangeRequestController } from "../controllers/changeRequestController.js";
import { auth } from "../middlewares/auth.js";
import { checkPermission } from '../middlewares/permissions.js';

const router = express.Router();

router.post("/", auth, ChangeRequestController.solicitar);
router.get("/", auth, checkPermission("configuracoes", "view"), ChangeRequestController.listarPendentes);
router.get("/approve", ChangeRequestController.aprovarPorToken);
router.get("/deny", ChangeRequestController.negarPorToken);

export default router;
