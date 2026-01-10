import prisma from '../database/prismaClient.js';

export const MembroRepo = {
    async buscarTodos({ incluirInativos = false }) {
        return await prisma.membro.findMany({
            where: incluirInativos ? {} : { isActive: true },
            include: {
                funcao: {
                    select: { nomeFuncao: true }
                }
            }
        });
    },

    async buscarPorId(id) {
        return await prisma.membro.findUnique({
            where: { id },
            include: {
                funcao: {
                    select: { nomeFuncao: true }
                }
            }
        });
    },

    async criar(dados) {

        const cleanData = { ...dados };
        if (!cleanData.participacao || cleanData.participacao.length === 0) {
            delete cleanData.participacao;
        }
        
        if (!cleanData.funcaoId) {
            throw Object.assign(
                new Error("Impossível criar membro sem função"),
                { status: 404 }
            );
        }

        return await prisma.membro.create({ data: cleanData });
    },



    async atualizar(id, dados) {
        const { funcaoId, ...resto } = dados;

        return await prisma.membro.update({
            where: { id },
            data: {
                ...resto,
                ...(funcaoId ? { funcao: { connect: { id: funcaoId } } } : {})
            },
        });
    },


    async deletar(id) {
        return await prisma.membro.update({ where: { id }, data: { isActive: false } });
    }
}