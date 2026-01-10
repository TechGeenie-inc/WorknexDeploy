import { EventoRepo } from '../repositories/eventoRepo.js';

export const EventoController = {
    async listar(req, res) {
        try {
            const incluirInativos = req.query.inativos === 'true';
            const eventos = await EventoRepo.buscarTodos({ incluirInativos });
            res.json(eventos);
        } catch (error) {
            console.error("Erro ao listar eventos:", error);
            res.status(500).json({ erro: "Erro ao listar eventos" });
        }
    },

    async buscar(req, res) {
        try {
            const { id } = req.params;
            const evento = await EventoRepo.buscarPorId(id);

            if (!evento) {
                return res.status(404).json({ erro: "Evento não encontrado" });
            }

            res.json(evento);
        } catch (error) {
            console.error("Erro ao buscar evento:", error);
            res.status(500).json({ erro: "Erro ao buscar evento" });
        }
    },

    async criar(req, res) {
        try {
            const novo = await EventoRepo.criar(req.body);
            res.status(201).json(novo);
        } catch (error) {
            console.error("Erro ao criar evento:", error);
            res.status(500).json({ erro: "Erro ao criar evento" });
        }
    },

    async atualizar(req, res) {
        try {
            const { id } = req.params;
            const atualizado = await EventoRepo.atualizar(id, req.body);
            res.json(atualizado);
        } catch (error) {
            console.error("Erro ao atualizar evento:", error);
            res.status(500).json({ erro: "Erro ao atualizar evento" });
        }
    },

    async deletar(req, res) {
        try {
            const { id } = req.params;
            await EventoRepo.deletar(id);
            res.json({ mensagem: `Evento ${id} marcado como inativo.` });
        } catch (error) {
            console.error("Erro ao deletar evento:", error);
            res.status(500).json({ erro: "Erro ao deletar evento" });
        }
    },
}