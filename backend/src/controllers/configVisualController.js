import { ConfigVisualRepo } from '../repositories/configVisualRepo.js';

export const ConfigVisualController = {
    async get(req, res) {
        try {
            let config = await ConfigVisualRepo.get();
            // Se não existir config ainda, retornamos um objeto vazio para o front não quebrar
            if (!config) config = {}; 
            res.json(config);
        } catch (e) {
            console.error("Erro ao carregar visual", e);
            res.status(500).json({ error: "Erro ao carregar configurações visuais" });
        }
    },

    async atualizar(req, res) {
        try {
            const dados = req.body;
            const atualizado = await ConfigVisualRepo.atualizar(dados);
            res.json(atualizado);
        } catch (e) {
            console.error("Erro ao atualizar visual", e);
            res.status(500).json({ error: "Erro ao atualizar configurações visuais" });
        }
    }
}