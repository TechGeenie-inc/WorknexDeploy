import prisma from "../database/prismaClient.js";
import { v4 as uuid } from 'uuid';

export const EventoRepo = {
    async buscarTodos({ incluirInativos = false }) {
        const where = incluirInativos ? {} : { isActive: true };
        const eventos = await prisma.evento.findMany({
            where,
        });

        return eventos;
    },

    async buscarPorId(id) {
        return await prisma.evento.findUnique({ where: { id } });
    },

    async criar(dados) {
        return await prisma.evento.create({ data: dados });
    },

    async atualizar(id, dados) {
        return await prisma.evento.update({ where: { id }, data: dados });
    },

    async deletar(id) {
        return await prisma.evento.update({ where: { id }, data: { isActive: false } });
    },

    async criarEventoEquipe(equipe) {
        if(!equipe) throw new Error("Equipe invalida para criar evento");

        const evento = await prisma.evento.create({
            data: {
                id: uuid(),
                title: equipe.nomeEquipe,
                start: equipe.dataInicio,
                end: equipe.dataFinal,
                equipeId: equipe.id,
                color: this.randomColor(),
            }
        });
        
        return evento;
    },

    async atualizarEventoEquipe(equipe) {
        if(!equipe || !equipe.id) throw new Error("Equipe invalida para atualizar evento");

        const eventoExistente = await prisma.evento.findFirst({
            where: { equipeId: equipe.id },
        });

        if (!eventoExistente) {
            return await this.criarEventoEquipe(equipe);
        }

        const eventoAtualizado = await prisma.evento.update({
            where: { id: eventoExistente.id },
            data: {
                title: equipe.nomeEquipe,
                start: equipe.dataInicio,
                end: equipe.dataFinal,
                color: eventoExistente.color,
            }
        });

        return eventoAtualizado;
    },

    async inativarEventoEquipe(equipeId) {
        return await prisma.evento.update({
            where: { equipeId },
            data: { isActive: false }
        });
    },

    randomColor() {
        const cores = [
            { primary: '#1E90FF', secondary: '#D0E8FF' },
            { primary: '#FF5733', secondary: '#FFD8CC' },
            { primary: '#28A745', secondary: '#DFF5E1' },
            { primary: '#FFC300', secondary: '#FFF3CC' },
            { primary: '#6F42C1', secondary: '#E3D7F7' },
            { primary: '#E83E8C', secondary: '#F8D0E3' },
            { primary: '#DC3545', secondary: '#F7D0D4' },
            { primary: '#20C997', secondary: '#D1F2EB' },
            { primary: '#8B0000', secondary: '#F2DADA' },
            { primary: '#ADFF2F', secondary: '#EDFFD6' },
            { primary: '#FF00FF', secondary: '#FFD6FF' },
            { primary: '#A52A2A', secondary: '#E8CFCF' },
            { primary: '#17A2B8', secondary: '#D0F0F5' },
            { primary: '#FFD700', secondary: '#FFF8CC' },
            { primary: '#9370DB', secondary: '#E6D9F7' },
            { primary: '#F5F5DC', secondary: '#FFFFFF' },
            { primary: '#32CD32', secondary: '#D6F7D6' },
            { primary: '#9966CC', secondary: '#E8DFF7' },
        ];
        return cores[Math.floor(Math.random() * cores.length)];
    },


}
