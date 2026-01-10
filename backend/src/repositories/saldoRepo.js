import prisma from '../database/prismaClient.js';

export const SaldoRepo = {
    async obter() {
        const saldo = await prisma.saldo.findFirst();
        if (!saldo) {
            return await prisma.saldo.create({ data: { total: 0 }})
        };
        return saldo;
    },

    async atualizarPorTransacao(transacao, acao = "add") {
        const saldo = await this.obter();
        let novoValor = saldo.total;

        const valor = transacao.valor ?? 0;
        const tipo = transacao.tipo;

        if (tipo === "receita") {
            novoValor += acao === "add" ? valor : -valor;
        } else if (tipo === "despesa" || tipo === "despesaOperacional") {
            novoValor += acao === "add" ? -valor : valor;
        }

        return await prisma.saldo.update({
            where: { id: saldo.id },
            data: { total: novoValor },
        });
    }
}