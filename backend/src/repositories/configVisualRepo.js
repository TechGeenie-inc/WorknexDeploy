import prisma from '../database/prismaClient.js';

export const ConfigVisualRepo = {
    async get() {
        // Busca a config ou retorna nulo se não existir
        return await prisma.configVisual.findUnique({ where: { id: 1 } });
    },

    async atualizar(dados) {
        // Remove campos que não devem ser salvos diretamente, como 'id' ou 'atualizadoEm' se vierem do front
        const { id, atualizadoEm, ...dadosLimpos } = dados;

        return await prisma.configVisual.upsert({
            where: { id: 1 },
            update: dadosLimpos,
            create: { id: 1, ...dadosLimpos }
        });
    }
}