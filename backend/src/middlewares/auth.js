import jwt from "jsonwebtoken";
import { UsuarioRepo } from "../repositories/usuarioRepo.js";

export const auth = async (req, res, next) => {
    const header = req.headers['authorization'];
    if (!header) return res.status(401).json({ erro: "Token não informado" });
    const [bearer, token] = header.split(" ");

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const usuario = await UsuarioRepo.buscarPorId(decoded.id);

        if (!usuario) return res.status(401).json({ erro: "Usuario não encontrado" });

        req.usuario = usuario;
        next();
    } catch (e) {
        return res.status(401).json({ err: "Token invalido" });
    }
}