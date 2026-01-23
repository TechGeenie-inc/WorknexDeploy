import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { UsuarioRepo } from "../repositories/usuarioRepo.js";
import { enviarEmail } from "../utils/email.js";
import { ChangeRequestRepo } from '../repositories/changeRequestRepo.js';

export const AuthController = {
    async signup(req, res) {
        try {
            const { email, senha, nome, role, permissions } = req.body;
            const hash = await bcrypt.hash(senha, 10);
            const expiracao = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

            const usuario = await UsuarioRepo.criar({
                email,
                senhaHash: hash,
                nome,
                role: role ?? "admin",
                permissions: permissions ?? {},

                senhaTemporaria: true,
                senhaExpiraEm: expiracao
            });

            (async () => {
                try {
                    await enviarEmail(
                        email,
                        "Bem vindo ao sistema Worknex!",
                        `<div style="font-family: Arial; padding: 20px;">
                        <h2>Bem-vindo, ${nome}!</h2>
                        <p>Seu acesso ao sistema Worknex acaba de ser liberado.</p>
                        <p>Qualquer dúvida, estamos à disposição!</p>
                        <p><strong>Equipe Worknex</strong></p>
                        <p>A senha escolhida para você foi <strong>${senha}</strong></p>
                        <p><strong>Essa senha precisa ser alterada! Ela deixará de ser válida em 7 dias.<strong><p>
                        </div>`
                    );
                } catch (e) {
                    console.error("Erro ao enviar email de boas-vindas: ", e);
                }
            })();

            return res.json(usuario);
        } catch (e) {
            return res.status(500).json({ erro: e.message });
        }
    },

    async login(req, res) {
        try {
            const { email, senha } = req.body;
            const usuario = await UsuarioRepo.buscarPorEmail(email);
            if (!usuario) return res.status(401).json({ erro: "Usuário ou senha inválidos" });

            const ok = await bcrypt.compare(senha, usuario.senhaHash);
            if (!ok) return res.status(401).json({ erro: "Usuário ou senha inválidos" });

            if (!usuario.isActive) return res.status(403).json({ erro: "Usuário inativo. Contate o administrador" });

            if (usuario.autenticacaoAtiva === true) {
                const codigo = Math.floor(100000 + Math.random() * 900000).toString();
                const expiracao = new Date(Date.now() + 5 * 60 * 1000);

                await UsuarioRepo.atualizar(usuario.id, {
                    twoFactorCode: codigo,
                    twoFactorExpires: expiracao
                });

                (async () => {
                    try {
                        await enviarEmail(
                            usuario.email,
                            "Seu código de verificação (2FA)",
                            `
                            <h2>Seu código de verificação</h2>
                            <p>Olá, ${usuario.nome}. Seu código é:</p>
                            <h1>${codigo}</h1>
                            <p>Ele expira em 5 minutos.</p>
                            `
                        );
                    } catch (e) {
                        console.error("Erro ao enviar email 2FA:", e);
                    }
                })();

                return res.json({
                    etapa: "2FA",
                    mensagem: "Código enviado para o e-mail",
                    email: usuario.email
                });
            } else {

                await UsuarioRepo.atualizar(usuario.id, { lastLogin: new Date() });
                (async () => {
                    try {
                        await enviarEmail(
                            usuario.email,
                            "Novo login detectado",
                            `<p>Olá, ${usuario.nome}!</p>
                            <p>Um novo login em sua conta 
                            foi realizado em 
                            ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}</p>`
                        );
                    } catch (e) {
                        console.error("Erro ao enviar email de login: ", e);
                    }
                })();

                const token = jwt.sign(
                    { id: usuario.id, role: usuario.role },
                    process.env.JWT_SECRET,
                    { expiresIn: "1d" }
                );

                return res.json({ token });
            }

        } catch (e) {
            return res.status(500).json({ erro: e.message });
        }
    },

    async checkEmail(req, res) {
        try {
            const { email } = req.query;
            if (!email) return res.status(400).json({ message: "Email eh obrigatorio!" });

            const usuario = await UsuarioRepo.buscarPorEmail(email);

            return res.json({ exists: !!usuario });
        } catch (e) {
            console.error("Erro ao verificar email,", e);
            res.status(500).json({ message: "Erro interno no servidor" });
        }
    },

    async me(req, res) {
        try {
            const usuario = req.usuario;

            return res.json({
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
                role: usuario.role,
                permissions: usuario.permissions,
                autenticacaoAtiva: usuario.autenticacaoAtiva
            });
        } catch (e) {
            return res.status(500).json({ erro: e.message });
        }
    },

    async listar(req, res) {
        try {
            const incluirInativos = req.query.incluirInativos === 'true';
            const usuarios = await UsuarioRepo.buscarTodos({ incluirInativos });
            res.json(usuarios);
        } catch (error) {
            console.error("Erro ao listar usuarios:", error);
            res.status(500).json({ erro: "Erro ao listar usuarios" });
        }
    },

    async atualizar(req, res) {
        try {
            const { id } = req.params;
            const { nome, role, email, senha, permissions, isActive, autenticacaoAtiva } = req.body;

            const alvo = await UsuarioRepo.buscarPorId(id);
            if (!alvo) return res.status(404).json({ erro: "Usuario não encontrado" });

            if (alvo.role === 'adminMaster' && req.usuario.id !== alvo.id) {
                return res.status(403).json({ erro: "Você não tem permissão para editar o Administrador de origem" });
            }

            if (alvo.role === "adminMaster" && role && role !== "adminMaster") {
                return res.status(400).json({ erro: "O Administrador de Origem não pode ter o cargo alterado" });
            }

            const updateData = { nome, role, permissions, isActive };

            if (typeof autenticacaoAtiva !== "undefined") {
                updateData.autenticacaoAtiva = autenticacaoAtiva;
            }

            if (email) updateData.email = email;

            if (senha) {
                const hash = await bcrypt.hash(senha, 10);
                updateData.senhaHash = hash;
            }

            const atualizado = await UsuarioRepo.atualizar(id, updateData);
            res.json(atualizado);
        } catch (error) {
            console.error("Erro ao atualizar usuario:", error);
            res.status(500).json({ erro: "Erro ao atualizar usuario" });
        }
    },

    async desativar(req, res) {
        try {
            const { id } = req.params;
            const alvo = await UsuarioRepo.buscarPorId(id);

            if (alvo.role === "adminMaster") {
                return res.status(400).json({
                    erro: "O administrador de origem não pode ser desativado"
                });
            }

            res.json({ mensagem: `Usuario ${id} marcado como inativo.` });
            await UsuarioRepo.desativar(id);

        } catch (error) {

            console.error("Erro ao deletar usuario:", error);
            res.status(500).json({ erro: "Erro ao deletar usuario" });

        }
    },

    async buscarPorId(req, res) {
        try {
            const { id } = req.params;
            const usuario = await UsuarioRepo.buscarPorId(id);
            if (!usuario) return res.status(404).json({ erro: "Usuario nao encontrado" });
            res.json(usuario);
        } catch (error) {
            console.error("Erro ao buscar usuario:", error);
            res.status(500).json({ erro: "Erro ao buscar usuario" });
        }
    },

    async reativar(req, res) {
        try {
            const { id } = req.params;
            const alvo = await UsuarioRepo.buscarPorId(id);

            if (alvo.role === "adminMaster") {
                return res.status(400).json({
                    erro: "O administrador de origem não pode ser desativado"
                });
            }

            await UsuarioRepo.reativar(id);
            res.json({ mensagem: `Usuario ${id} reativado com sucesso` });

        } catch (e) {

            console.error("Erro ao deletar usuario: ", e);
            res.status(500).json({ erro: "Erro ao reativar usuario" });

        }
    },

    async verificar2FA(req, res) {
        try {
            const { email, codigo } = req.body;

            if (!email || !codigo)
                return res.status(400).json({ erro: "Email e código são obrigatórios." });

            const usuario = await UsuarioRepo.buscarPorEmail(email);

            if (!usuario)
                return res.status(404).json({ erro: "Usuário não encontrado." });

            if (!usuario.twoFactorCode)
                return res.status(400).json({ erro: "Nenhum código foi gerado." });

            if (!usuario.twoFactorExpires)
                return res.status(400).json({ erro: "Código inválido ou não gerado." });

            const expirado = usuario.twoFactorExpires < new Date();
            if (expirado)
                return res.status(400).json({ erro: "Código expirado. Solicite outro login." });

            if (usuario.twoFactorCode !== codigo)
                return res.status(400).json({ erro: "Código inválido." });

            await UsuarioRepo.atualizar(usuario.id, {
                twoFactorCode: null,
                twoFactorExpires: null,
                lastLogin: new Date()
            });

            const token = jwt.sign(
                { id: usuario.id, role: usuario.role },
                process.env.JWT_SECRET,
                { expiresIn: "1d" }
            );

            return res.json({
                sucesso: true,
                token
            });
        } catch (e) {
            console.error("Erro ao verificar 2FA, ", e);
            return res.status(500).json({ erro: "Erro ao verificar 2FA" });
        }
    },

    async toggle2FA(req, res) {
        try {
            const usuario = await UsuarioRepo.buscarPorId(req.usuario.id);

            if (!usuario) {
                return res.status(404).json({ erro: "Usuário não encontrado" });
            }

            const novoStatus = !usuario.autenticacaoAtiva;

            await UsuarioRepo.atualizar(usuario.id, {
                autenticacaoAtiva: novoStatus
            });

            return res.json({
                mensagem: `2FA ${novoStatus ? "ativado" : "desativado"} com sucesso`,
                autenticacaoAtiva: novoStatus
            });

        } catch (e) {
            console.error("Erro ao alternar 2FA:", e);
            res.status(500).json({ erro: "Erro ao alternar 2FA" });
        }
    },

    async deletar(req, res) {
        try {
            const { id } = req.params;
            const alvo = await UsuarioRepo.buscarPorId(id);

            if (alvo.role === "adminMaster") {
                return res.status(401).json({
                    erro: "O administrador de origem não pode ser deletado"
                });
            }

            res.json({ mensagem: `Usuario ${id} deletado permanentemente.` });
            await UsuarioRepo.deletar(id);

        } catch (error) {

            console.error("Erro ao deletar usuario:", error);
            res.status(500).json({ erro: "Erro ao deletar usuario" });

        }
    },

    async changeMyPassword(req, res) {
        try {
            const usuarioId = req.usuario.id;
            const { oldPassword, newPassword } = req.body;

            if (!oldPassword || !newPassword) {
                return res.status(400).json({ erro: "Senha antiga e nova são obrigatórios." });
            }

            const usuario = await UsuarioRepo.buscarPorId(usuarioId);
            if (!usuario) return res.status(404).json({ erro: "Usuário não encontrado." });

            const ok = await bcrypt.compare(oldPassword, usuario.senhaHash);
            if (!ok) return res.status(401).json({ erro: "Senha atual inválida." });

            const hash = await bcrypt.hash(newPassword, 10);

            await UsuarioRepo.atualizar(usuarioId, {
                senhaHash: hash,
                senhaTemporaria: false,
                senhaExpiraEm: null
            });

            (async () => {
                try {
                    await enviarEmail(
                        usuario.email,
                        "Senha alterada",
                        `<p>Olá, ${usuario.nome}!</p>
                        <p>Sua senha foi alterada corretamente!</p>`
                    );
                } catch (e) {
                    console.error("Erro ao enviar email de aviso de troca de senha:", e);
                }
            })();

            return res.json({ sucesso: true, mensagem: "Senha alterada com sucesso." });
        } catch (e) {
            console.error("Erro ao alterar minha senha:", e);
            return res.status(500).json({ erro: "Erro interno ao alterar senha." });
        }
    },

    async changeMyData(req, res) {
        try {
            const usuarioId = req.usuario.id;
            const { nome, email } = req.body;

            if (!nome && !email) {
                return res.status(400).json({ erro: "Envie ao menos nome ou email." });
            }

            const usuario = await UsuarioRepo.buscarPorId(usuarioId);
            if (!usuario) return res.status(404).json({ erro: "Usuário não encontrado." });

            const updateData = {};
            if (nome) updateData.nome = nome;

            const cleanEmail = typeof email === "string" ? email.trim().toLowerCase() : null;
            if (cleanEmail) {
                const jaExiste = await UsuarioRepo.buscarPorEmail(cleanEmail);
                if (jaExiste && jaExiste.id !== usuarioId) {
                    return res.status(409).json({ erro: "Esse e-mail já está em uso." });
                }
                updateData.email = email;
            }

            const atualizado = await UsuarioRepo.atualizar(usuarioId, updateData);

            return res.json({
                sucesso: true,
                usuario: {
                    id: atualizado.id,
                    nome: atualizado.nome,
                    email: atualizado.email,
                    role: atualizado.role,
                    permissions: atualizado.permissions,
                    autenticacaoAtiva: atualizado.autenticacaoAtiva
                }
            });

        } catch (e) {
            console.error("Erro ao alterar meus dados:", e);
            return res.status(500).json({ erro: "Erro interno ao atualizar dados." });
        }
    },

    async forgotPassword(req, res) {
        try {
            const { email } = req.body;
            if (!email) return res.status(400).json({ erro: "Email é obrigatório." });

            const usuario = await UsuarioRepo.buscarPorEmail(email);

            if (!usuario) {
                return res.json({ sucesso: true, mensagem: "Se existir uma conta, enviaremos instruções por e-mail." });
            }

            await ChangeRequestRepo.negateOldRequests(usuario.id);

            const token = crypto.randomBytes(32).toString("hex");
            const expiraEm = new Date(Date.now() + 30 * 60 * 1000);

            await ChangeRequestRepo.criar(usuario.id, "password", {}, token, expiraEm);

            const resetLink = `${process.env.FRONT_URL}?token=${token}`;

            (async () => {
                try {
                    await enviarEmail(
                        usuario.email,
                        "Redefinição de senha",
                        `<p>Olá, ${usuario.nome}.</p>
                        <p>Para redefinir sua senha, clique no link abaixo (válido por 5 minutos):</p>
                        <p><a href="${resetLink}">Redefinir senha</a></p>
                        <p>Se você não solicitou isso, ignore este e-mail.</p>`
                    );
                } catch (e) {
                    console.error("Erro ao enviar email de reset:", e);
                }
            })();

            return res.json({ sucesso: true, mensagem: "Se existir uma conta, enviaremos instruções por e-mail." });
        } catch (e) {
            console.error("Erro forgotPassword:", e);
            return res.status(500).json({ erro: "Erro interno." });
        }
    },

    async resetPassword(req, res) {
        try {
            const { token, newPassword } = req.body;
            if (!token || !newPassword) {
                return res.status(400).json({ erro: "Token e newPassword são obrigatórios." });
            }

            const reqSenha = await ChangeRequestRepo.buscarPorToken(token);
            if (!reqSenha) return res.status(400).json({ erro: "Token inválido." });

            if (reqSenha.tipo !== "password") {
                return res.status(400).json({ erro: "Token inválido para troca de senha." });
            }

            if (reqSenha.situacao !== "pendente") {
                return res.status(400).json({ erro: "Token já utilizado ou inválido." });
            }

            if (reqSenha.expiraEm < new Date()) {
                await ChangeRequestRepo.negar(reqSenha.id);
                return res.status(400).json({ erro: "Token expirado. Solicite novamente." });
            }

            const hash = await bcrypt.hash(newPassword, 10);

            await UsuarioRepo.atualizar(reqSenha.usuarioId, {
                senhaHash: hash,
                senhaTemporaria: false,
                senhaExpiraEm: null
            });

            await ChangeRequestRepo.aprovar(reqSenha.id);

            return res.json({ sucesso: true, mensagem: "Senha redefinida com sucesso." });
        } catch (e) {
            console.error("Erro resetPassword:", e);
            return res.status(500).json({ erro: "Erro interno." });
        }
    },


}