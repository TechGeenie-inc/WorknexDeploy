import prisma from '../database/prismaClient.js';

export const ConfigRepo = {
    async get() {
        return await prisma.config.findUnique({ where: { id: 1 } });
    },

    async atualizar(dados) {
        return await prisma.config.upsert({
            where: { id: 1 },
            update: dados,
            create: { id: 1, ...dados }
        })
    }
}