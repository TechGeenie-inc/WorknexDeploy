import prisma from '../database/prismaClient.js';
import crypto from 'crypto';

export const ChangeRequestRepo = {
    async criar(usuarioId, tipo, dadosNovos, tokenAprovacao = null, expiraEm = null) {
        const token = tokenAprovacao ?? crypto.randomBytes(32).toString("hex");
        const exp = expiraEm ?? new Date(Date.now() + 5 * 60 * 1000);

        return await prisma.changeRequest.create({
            data: {
                usuarioId,
                tipo,
                dadosNovos,
                tokenAprovacao: token,
                expiraEm: exp,
            }
        })
    },

    async buscarPorToken(tokenAprovacao) {
        return await prisma.changeRequest.findUnique({
            where: { tokenAprovacao },
            include: {
                usuario: true,
            }
        });
    },

    async buscarPendentes() {
        return await prisma.changeRequest.findMany({
            where: {
                situacao: "pendente"
            },
            orderBy: { criadoEm: "asc" },
            include: {
                usuario: true
            }
        });
    },

    async buscarPorId(id) {
        return await prisma.changeRequest.findUnique({
            where: { id },
            include: {
                usuario: true
            }
        });
    },

    async aprovar(id) {
        return await prisma.changeRequest.update({
            where: { id },
            data: {
                situacao: "aprovado"
            }
        });
    },

    async negar(id) {
        return await prisma.changeRequest.update({
            where: { id },
            data: {
                situacao: "negado"
            }
        });
    },

    async deletar(id) {
        return await prisma.changeRequest.delete({
            where: { id }
        });
    },

    async marcarExpirado(id) {
        return await prisma.changeRequest.update({
            where: { id },
            data: {
                situacao: "negado"
            }
        })
    },

    async negateOldRequests(usuarioId) {
        return prisma.changeRequest.updateMany({
            where: { usuarioId, tipo: "password", situacao: "pendente" },
            data: { situacao: "negado" }
        });
    }
}