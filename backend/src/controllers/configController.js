import { ConfigRepo } from '../repositories/configRepo.js';

export const ConfigController = {
    async get(req, res) {
        try {
            const config = await ConfigRepo.get();
            res.json(config);
        } catch (e) {
            console.error("Erro ao carregar configuracoes, ", e);
            res.status(500).json({ error: "Erro ao carregar configuracoes" });
        }
    },

    async atualizar(req, res) {
        try {
            const dados = req.body;
            const atualizado = await ConfigRepo.atualizar(dados);
            res.json(atualizado);
        } catch (e) {
            console.error("Erro ao atualizar configuracoes", e);
            res.status(500).json({ erro: "Erro ao atualizar configuracoes" });
        }
    }
}