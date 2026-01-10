import prisma from '../database/prismaClient.js';
import { ClienteRepo } from './clienteRepo.js';
import { EventoRepo } from './eventoRepo.js';

export const EquipeRepo = {
    async buscarTodos({ incluirInativos = false }) {
        return await prisma.equipe.findMany({
            where: incluirInativos ? {} : { isActive: true },
            include: {
                membros: {
                    include: {
                        funcao: true,
                        participacao: true
                    }
                },
                cliente: true,
                participacaoMembros: true,
            }
        });
    },

    async buscarPorId(id) {
        return await prisma.equipe.findUnique({
            where: { id },
            include: {
                cliente: true,
                participacaoMembros: true,
                membros: {
                    include: {
                        funcao: true,
                        participacao: { where: { equipeId: id } }
                    }
                }
            }
        });
    },

    async criar(dados) {
        const dataInicio = dados.dataInicio ? new Date(dados.dataInicio) : null;
        const dataFinal = dados.dataFinal ? new Date(dados.dataFinal) : null;

        if (dataInicio && isNaN(dataInicio)) {
            throw new Error("Data de início inválida");
        }

        if (dataFinal && isNaN(dataFinal)) {
            throw new Error("Data final inválida");
        }


        const { membrosIds = [], participacaoMembros = [], ...rest } = dados;

        if (!membrosIds.length) {
            throw Object.assign(
                new Error("Equipe sem membros"),
                { status: 403 }
            )
        }

        const equipe = await prisma.equipe.create({
            data: {
                ...rest,
                dataInicio: corrigirFuso(dataInicio),
                dataFinal: corrigirFuso(dataFinal),
                membros: membrosIds.length ? { connect: membrosIds.map(membroId => ({ id: membroId })) } : undefined,
            },
            include: {
                membros: {
                    include: {
                        funcao: true,
                        participacao: true,
                    }
                }
            }
        });

        if (participacaoMembros.length) {
            await prisma.participacaoMembro.createMany({
                data: participacaoMembros.map(p => ({
                    equipeId: equipe.id,
                    membroId: p.membroId,
                    dataInicio: corrigirFuso(new Date(p.dataInicio)),
                    dataFim: corrigirFuso(new Date(p.dataFim)),
                }))
            });
        }

        const count = await prisma.participacaoMembro.count({
            where: { equipeId: equipe.id }
        });

        await EventoRepo.criarEventoEquipe(equipe);
        await ClienteRepo.recalcularProjetos(equipe.clienteId);
        return equipe;
    },

    async atualizar(id, dados) {
        const dataInicio = dados.dataInicio ? new Date(dados.dataInicio) : null;
        const dataFinal = dados.dataFinal ? new Date(dados.dataFinal) : null;

        if (dataInicio && isNaN(dataInicio)) throw new Error("Data de início inválida");
        if (dataFinal && isNaN(dataFinal)) throw new Error("Data final inválida");

        const { participacaoMembros = [] } = dados;

        const membrosIds =
            dados.membrosIds ||
            (Array.isArray(dados.membros) ? dados.membros.map(m => m.id) : []);

        const dataUpdate = {
            nomeEquipe: dados.nomeEquipe ?? undefined,
            clienteSelecionado: dados.clienteSelecionado ?? undefined,
            tarefa: dados.tarefa ?? undefined,
            status: dados.status ?? undefined,
            isActive: dados.isActive ?? undefined,
            dataInicio: corrigirFuso(dataInicio),
            dataFinal: corrigirFuso(dataFinal),
            ...(membrosIds.length && { membros: { set: membrosIds.map(id => ({ id })) } }),
        };

        if (!membrosIds.length) {
            throw Object.assign(
                new Error("Equipe sem membros"),
                { status: 403 }
            )
        }

        if (dados.clienteId) {
            dataUpdate.cliente = { connect: { id: dados.clienteId } };
        }

        const equipe = await prisma.equipe.update({
            where: { id },
            data: dataUpdate,
            include: {
                cliente: true,
                membros: { include: { funcao: true, participacao: true } },
            },
        });

        if (participacaoMembros.length) {
            await prisma.participacaoMembro.deleteMany({ where: { equipeId: id } });
            await prisma.participacaoMembro.createMany({
                data: participacaoMembros.map(p => ({
                    equipeId: id,
                    membroId: p.membroId,
                    dataInicio: corrigirFuso(new Date(p.dataInicio)),
                    dataFim: corrigirFuso(new Date(p.dataFim)),
                }))
            });
        }
        

        const count = await prisma.participacaoMembro.count({
            where: { equipeId: equipe.id }
        });

        await EventoRepo.atualizarEventoEquipe(equipe);
        await ClienteRepo.recalcularProjetos(equipe.clienteId);
        return equipe;
    },



    async deletar(id) {
        const equipe = await prisma.equipe.update({
            where: { id },
            data: { isActive: false }
        });

        await EventoRepo.inativarEventoEquipe(equipe.id)
        await ClienteRepo.recalcularProjetos(equipe.clienteId);
        return equipe;
    },

    async atualizarStatus(id, status) {
        const equipe = await prisma.equipe.update({
            where: { id },
            data: { status }
        });
        await ClienteRepo.recalcularProjetos(equipe.clienteId);
        return equipe;
    },

}

function corrigirFuso(date) {
    if (!date) return null;
    const d = new Date(date);
    d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
    return d;
}