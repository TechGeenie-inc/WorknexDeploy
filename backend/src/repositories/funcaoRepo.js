import prisma from '../database/prismaClient.js';

export const FuncaoRepo = {
    async buscarTodos({ incluirInativos = false }) {
        const where = incluirInativos ? {} : { isActive: true }; 

        const funcoes = await prisma.funcao.findMany({
            where, 
            orderBy: {
                cadastro: 'asc'
            }
        })

        return funcoes;
    },

    async buscarPorId(id) {
        return await prisma.funcao.findUnique({
            where: { id }
        })
    },

    async criar(dados) {
        return await prisma.funcao.create({ data: dados });
    },

    async atualizar(id, dados) {
        return await prisma.funcao.update({
            where: { id }, data: dados
        });
    },

    async deletar(id) {
        return await prisma.funcao.update({
            where: { id }, data: { isActive: false }
        });
    }
}