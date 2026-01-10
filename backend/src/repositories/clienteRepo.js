import prisma from '../database/prismaClient.js';

export const ClienteRepo = {
    async buscarTodos({ incluirInativos = false }) {
        const where = incluirInativos ? {} : { isActive: true };
        const clientes = await prisma.cliente.findMany({
            where,
            orderBy: {
                cadastro: 'asc'
            }
        });

        return clientes;
    },

    async buscarPorId(id) {
        return await prisma.cliente.findUnique({ where: { id } });
    },

    async criar(dados) {
        return await prisma.cliente.create({ data: dados });
    },

    async atualizar(id, dados) {
        return await prisma.cliente.update({ where: { id }, data: dados });
    },

    async deletar(id) {
        return await prisma.cliente.update({ where: { id }, data: { isActive: false } });
    },

    async recalcularProjetos(idCliente) {
        const [total, ativos] = await Promise.all([
            prisma.equipe.count({
                where: { clienteId: idCliente, isActive: true },
            }),
            prisma.equipe.count({
                where: { clienteId: idCliente, isActive: true, status: 'EmAndamento'},
            }),
        ]);

        return await prisma.cliente.update({
            where: { id: idCliente },
            data: {
                projetosTotal: total,
                projetosAtivos: ativos,
            },
        });
    }
}