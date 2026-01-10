import { ChangeRequestRepo } from '../repositories/changeRequestRepo.js';
import { UsuarioRepo } from '../repositories/usuarioRepo.js';
import bcrypt from 'bcrypt';
import { enviarEmail } from '../utils/email.js';
import dotenv from 'dotenv';

dotenv.config();

export const ChangeRequestController = {

    async solicitar(req, res) {
        try {
            const usuario = req.usuario;
            const { tipo, dadosNovos } = req.body;

            if (!tipo || !dadosNovos) {
                return res.status(400).json({ erro: "Tipo e dados novos são obrigatórios." });
            }

            if (usuario.role === "admin" || usuario.role === "adminMaster") {
                if (tipo === "password") {
                    const hash = await bcrypt.hash(dadosNovos.novaSenha, 10);
                    await UsuarioRepo.atualizar(usuario.id, { senhaHash: hash, senhaTemporaria: false, senhaExpiraEm: null });
                }
                else if (tipo === "info") {
                    await UsuarioRepo.atualizar(usuario.id, dadosNovos);
                }

                return res.json({
                    mensagem: "Alteração aplicada imediatamente (admin)."
                });
            }

            if (tipo === "password") {
                const usuarioDB = await UsuarioRepo.buscarPorId(usuario.id);

                const senhaCorreta = await bcrypt.compare(dadosNovos.oldPassword, usuarioDB.senhaHash);
                if (!senhaCorreta) {
                    return res.status(400).json({ erro: "Senha atual incorreta." });
                }
                delete dadosNovos.oldPassword;
            }

            const request = await ChangeRequestRepo.criar(usuario.id, tipo, dadosNovos);

            const admins = await UsuarioRepo.buscarAdmins();

            const linkAprovar = `${process.env.BASE_URL}/change-request/approve?token=${request.tokenAprovacao}`;
            const linkNegar = `${process.env.BASE_URL}/change-request/deny?token=${request.tokenAprovacao}`;

            for (const admin of admins) {
                if (tipo === 'info') {
                    enviarEmail(
                        admin.email,
                        "Solicitação de alteração pendente",
                        `
                        O usuário ${req.usuario.nome} solicitou uma alteração nas informações pessoais de sua conta.
                        <br><br>
                        Novo e-mail: ${dadosNovos.email}
                        <br>
                        Novo nome: ${dadosNovos.nome}
                        <br><br><br><br>
                        Para APROVAR, clique aqui: ${linkAprovar}
                        <br><br><br>
                        Para NEGAR, clique aqui: ${linkNegar}
                        <br><br><br><br>
                        Esse link expira em 30 minutos.
                        `
                    );
                }
                if (tipo === 'password') {
                    enviarEmail(
                        admin.email,
                        "Solicitação de alteração pendente",
                        `
                        O usuário ${req.usuario.nome} solicitou uma alteração na senha de sua conta.
                        <br><br><br><br>
                        Para APROVAR, clique aqui: ${linkAprovar}
                        <br><br><br>
                        Para NEGAR, clique aqui: ${linkNegar}
                        <br><br><br><br>
                        Esse link expira em 30 minutos.
                        `
                    );
                }

            }

            return res.json({
                mensagem: "Solicitação enviada para aprovação.",
                request
            });

        } catch (e) {
            console.error(e);
            return res.status(500).json({ erro: "Erro ao enviar solicitação." });
        }
    },

    async listarPendentes(req, res) {
        try {
            const pendentes = await ChangeRequestRepo.buscarPendentes();
            return res.json(pendentes);
        } catch (e) {
            console.error(e);
            return res.status(500).json({ erro: "Erro ao buscar solicitações." });
        }
    },

    async aprovarPorToken(req, res) {
        try {
            const { token } = req.query;

            const request = await ChangeRequestRepo.buscarPorToken(token);
            if (!request) {
                return res.status(404).json({ erro: "Token inválido." });
            }

            if (request.expiraEm < new Date()) {
                await ChangeRequestRepo.marcarExpirado(request.id);
                return res.status(400).json({ erro: "Token expirado." });
            }

            if (request.situacao !== "pendente") {
                return res.status(400).json({ erro: "Solicitação já processada." });
            }

            if (request.tipo === "password") {
                const hash = await bcrypt.hash(request.dadosNovos.novaSenha, 10);
                await UsuarioRepo.atualizar(request.usuarioId, { senhaHash: hash, senhaTemporaria: false, senhaExpiraEm: null });

            } else if (request.tipo === "info") {
                await UsuarioRepo.atualizar(request.usuarioId, request.dadosNovos);
            }

            await ChangeRequestRepo.aprovar(request.id);

            return res.send(`
                <h2>Alteração aprovada com sucesso.</h2>
                <p>Você pode fechar esta aba.</p>
            `);

        } catch (e) {
            console.error(e);
            return res.status(500).json({ erro: "Erro ao aprovar." });
        }
    },

    async negarPorToken(req, res) {
        try {
            const { token } = req.query;

            const request = await ChangeRequestRepo.buscarPorToken(token);
            if (!request) {
                return res.status(404).json({ erro: "Token inválido." });
            }

            if (request.expiraEm < new Date()) {
                await ChangeRequestRepo.marcarExpirado(request.id);
                return res.status(400).json({ erro: "Token expirado." });
            }

            if (request.situacao !== "pendente") {
                return res.status(400).json({ erro: "Solicitação já processada." });
            }

            await ChangeRequestRepo.negar(request.id);

            return res.send(`
                <h2>Solicitação negada.</h2>
                <p>Você pode fechar esta aba.</p>
            `);

        } catch (e) {
            console.error(e);
            return res.status(500).json({ erro: "Erro ao negar." });
        }
    },
};


function filtrarCampos(dados) {
    const permitidos = ["nome", "email", "telefone", "cargo"];
    const filtrados = {};
    for (const key of permitidos) {
        if (dados[key] !== undefined) filtrados[key] = dados[key];
    }
    return filtrados;
}