export function somenteAdminMaster (req, res, next) {
    if (req.usuario.role !== "adminMaster") {
        return res.status(403).json({ erro: "Somente o administrador de origem pode realizar essa tarefa" });
    }

    next();
}