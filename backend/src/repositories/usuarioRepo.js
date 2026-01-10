import prisma from "../database/prismaClient.js";

export const UsuarioRepo = {
    async buscarTodos({ incluirInativos = false }) {
        const where = incluirInativos ? {} : { isActive: true };
        const usuarios = await prisma.usuario.findMany({
            where,
            orderBy: {
                criadoEm: 'asc'
            }
        });
        
        return usuarios;
    },
    
    async criar(dados) {
        return await prisma.usuario.create({ data: dados });
    },

    async buscarPorEmail(email) {
        return await prisma.usuario.findUnique({
            where: { email }
        });
    },

    async buscarPorId(id) {
        return await prisma.usuario.findUnique({
            where: { id }
        });
    },

    async desativar(id) {
        return await prisma.usuario.update({
            where: { id },
            data: { isActive: false }
        });
    },

    async atualizar(id, dados) {
        return await prisma.usuario.update({ where: { id }, data: dados });
    },

    async reativar(id) {
        return await prisma.usuario.update({
            where: { id },
            data: { isActive: true }
        })
    },

    async buscarAdmins() {
        return await prisma.usuario.findMany({
            where: { role: {
                in: ["admin", "adminMaster"]
            },
            isActive: true }
        });
    },

    async deletar(id) {
        return await prisma.usuario.delete({
            where: { id },
        })
    }
}