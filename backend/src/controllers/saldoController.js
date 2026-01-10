import { SaldoRepo } from "../repositories/saldoRepo.js";

export const SaldoController = {
    async obter(req, res) {
        try {
            const saldo = await SaldoRepo.obter();
            res.json(saldo);
        } catch (error) {
            console.error("Erro ao obter saldo:", error);
            res.status(500).json({ erro: "Erro ao obter saldo" });
        }
    }
}