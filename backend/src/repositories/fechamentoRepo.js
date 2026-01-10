import prisma from '../database/prismaClient.js';

export const FechamentoRepo = {
    async buscarTodos({ incluirInativos = false }) {
        return await prisma.fechamento.findMany({
            where: incluirInativos ? {} : { isActive: true },
            include: {
                equipe: {
                    include: {
                        cliente: true,
                        membros: {
                            include: {
                                funcao: true,
                            }
                        }
                    }
                },
                membrosFechados: {
                    include: { membro: true },
                },
            },
        });
    },

    async buscarPorId(id) {
        return await prisma.fechamento.findUnique({
            where: { id },
            include: {
                equipe: {
                    include: {
                        cliente: true,
                    }
                },
                membrosFechados: {
                    include: {
                        membro: {
                            include: {
                                funcao: true,
                            }
                        }
                    },
                },
            },
        });
    },

    async criar(dados) {
        const fechamento = await prisma.fechamento.create({
            data: {
                id: dados.id,
                equipe: { connect: { id: dados.idEquipe } },
                horasTotais: dados.horasTotais ?? 0,
                obs: dados.obs ?? null,
                valorTotal: dados.valorTotal ?? 0,
                status: dados.status ?? false,
                isActive: true,
                membrosFechados: {
                    create: dados.detalhesMembros?.map(m => ({
                        membro: { connect: { id: m.membroId } },
                        horasTrabalhadas: m.horasTrabalhadas,
                        horasExtras: m.horasExtras,
                        diarias: m.diarias,
                        adicional: m.adicional,
                        precoVenda: m.precoVenda ?? 0,
                        valorTotal: m.valorTotal,
                    })) || [],
                },
            },
            include: {
                equipe: true,
                membrosFechados: {
                    include: { membro: true },
                },
            },
        });

        return fechamento;
    },

    async atualizar(id, dados) {
        return await prisma.fechamento.update({
            where: { id },
            data: dados,
        });
    },

    async deletar(id) {
        return await prisma.fechamento.update({
            where: { id },
            data: { isActive: false },
        });
    },

    async updateExport(id, exportFlag) {
        return await prisma.fechamento.update({
            where: { id },
            data: { export: exportFlag }
        })
    },

    async findExports() {
        return await prisma.fechamento.findMany({
            where: {
                export: true,
                isActive: true,
            },
            include: {
                equipe: {
                    include: {
                        cliente: true,
                        membros: {
                            include: { funcao: true }
                        }
                    }
                },
                membrosFechados: {
                    include: { membro: true }
                }
            }
        })
    },

    async resetExports() {
        return prisma.fechamento.updateMany({
            where: { export: true },
            data: { export: false },
        });
    },

    
};
