import prisma from '../database/prismaClient.js';
import { SaldoRepo } from "./saldoRepo.js";
import { v4 as uuid } from 'uuid';


export const FaturaRepo = {
    async buscarTodos({ incluirInativos = false }) {
        return await prisma.fatura.findMany({
            where: incluirInativos ? {} : { isActive: true },
            include: {
                fechamento: {
                    include: {
                        equipe: {
                            include: {
                                cliente: true,
                                membros: true,
                            }
                        }
                    }
                }
            },
            orderBy: {
                friendlyId: 'asc',
            }
        });
    },

    async buscarPorId(id) {
        return await prisma.fatura.findUnique({
            where: { id },
            include: {
                fechamento: {
                    include: {
                        equipe: {
                            include: {
                                cliente: true,
                                membros: true,
                            }
                        }
                    }
                }
            }
        });
    },

    async criar(dados) {
        const vencimento = dados.vencimento ? new Date(dados.vencimento) : null;
        if (vencimento && isNaN(vencimento)) throw new Error("Data de vencimento invalida");

        if (!dados.fechamentoId) throw new Error("Fechamento é obrigatório para criar fatura");

        const fechamento = await prisma.fechamento.findUnique({
            where: { id: dados.fechamentoId },
            select: {
                equipe: {
                    select: {
                        cliente: true
                    }
                }
            }
        });

        if (!fechamento.equipe.cliente) throw new Error("Cliente nao encontrado a partir do fechamento");

        const clienteId = fechamento.equipe.cliente.id;

        const totalFaturasCliente = await prisma.fatura.count({
            where: {
                fechamento: {
                    equipe: {
                        clienteId: clienteId
                    }
                }
            }
        });

        const clienteNome = fechamento.equipe.cliente.razaoSocial || fechamento.equipe.cliente.nomeFantasia || fechamento.equipe.cliente.nomeCompleto;
        const clienteIniciais = clienteNome.substring(0, 2).toUpperCase();

        const dataBase = dados.criadoEm ?? new Date();
        const dataFormatada = formatDate(dataBase);

        const sequencial = String(totalFaturasCliente + 1).padStart(3, '0');
        const friendlyId = `${dataFormatada}-${sequencial}-${clienteIniciais}`;

        const { fechamentoId, ...rest } = dados;

        return await prisma.fatura.create({
            data: {
                ...rest,
                vencimento,
                friendlyId,
                fechamento: {
                    connect: { id: dados.fechamentoId }
                }
            },
        });
    },

    async atualizar(id, dados) {
        const vencimento = dados.vencimento ? new Date(dados.vencimento) : null;
        if (vencimento && isNaN(vencimento)) throw new Error("Data de vencimento invalida");
        const { ...rest } = dados;

        return await prisma.fatura.update({
            where: { id },
            data: {
                ...rest,
                vencimento,
            },
        });
    },

    async deletar(id) {
        return await prisma.fatura.update({
            where: { id }, data: { isActive: false }
        });
    },

    async atualizarStatus(id, status) {
        const faturaAtual = await prisma.fatura.findUnique({
            where: { id },
            include: {
                fechamento: {
                    include: {
                        equipe: {
                            include: {
                                cliente: true,
                            }
                        }
                    }
                }
            }
        });

        if (!faturaAtual) throw new Error("Fatura não encontrada");

        const faturaAtualizada = await prisma.fatura.update({
            where: { id },
            data: { status },
        });

        if (faturaAtual.status !== 'pago' && status === 'pago') {
            const cliente = faturaAtual.fechamento.equipe.cliente;
            const clienteNome = cliente.razaoSocial || cliente.nomeFantasia || cliente.nomeCompleto;
            const desc = `Pagamento Fatura ${faturaAtual.friendlyId} - ${clienteNome}`;

            const jaExiste = await prisma.transacao.findFirst({
                where: {
                    desc,
                    isActive: true
                }
            });

            if (!jaExiste) {
                const transacao = await prisma.transacao.create({
                    data: {
                        id: uuid(),
                        tipo: 'receita',
                        valor: faturaAtual.valorTotal,
                        data: new Date(),
                        categoria: 'fatura',
                        desc,
                        isActive: true,
                        faturaId: faturaAtual.id,
                    }
                })
                await SaldoRepo.atualizarPorTransacao(transacao, 'add');
            }

            return faturaAtualizada;
        }

        if (faturaAtual.status === 'pago' && status !== 'pago') {
            const transacao = await prisma.transacao.findFirst({
                where: {
                    faturaId: faturaAtual.id,
                    isActive: true
                }
            });

            if (transacao) {
                await prisma.transacao.update({
                    where: { id: transacao.id },
                    data: { isActive: false },
                })

                await SaldoRepo.atualizarPorTransacao(transacao, 'sub');
            }

            return faturaAtualizada;
        }
    },

    async verificarVencidas() {
        try {
            const hoje = new Date();
            hoje.setHours(0, 0, 0, 0);
            const vencidas = await prisma.fatura.findMany({
                where: {
                    status: 'pendente',
                    vencimento: { lt: hoje },
                    isActive: true,
                },
                select: { id: true },
            });

            if (vencidas.length === 0) {
                return { message: 'Nenhuma fatura vencida encontrada', total: 0, faturas: [] };
            }

            await prisma.fatura.updateMany({
                where: { id: { in: vencidas.map(f => f.id) } },
                data: { status: 'vencido' },
            });

            const todasFaturas = await prisma.fatura.findMany({
                where: { isActive: true },
                include: {
                    fechamento: {
                        include: {
                            equipe: {
                                include: {
                                    cliente: true,
                                    membros: true,
                                },
                            },
                        },
                    },
                },
            });

            return {
                message: 'Faturas vencidas atualizadas com sucesso',
                total: vencidas.length,
                faturas: todasFaturas,
            };
        } catch (error) {
            console.error('Erro ao verificar faturas vencidas:', error);
            throw error;
        }
    },

}

function formatDate(data) {
    const d = new Date(data);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}${m}${day}`;
}
