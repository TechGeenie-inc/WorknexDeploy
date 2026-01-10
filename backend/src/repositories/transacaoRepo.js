import prisma from "../database/prismaClient.js";
import { SaldoRepo } from "./saldoRepo.js";

export const TransacaoRepo = {
  async buscarTodos({ incluirInativos = false } = {}) {
    return await prisma.transacao.findMany({
      where: incluirInativos ? {} : { isActive: true },
      orderBy: { data: "desc" },
    });
  },

  async criar(dados) {
    const data = dados.data ? new Date(dados.data) : null;

    const transacao = await prisma.transacao.create({
      data: {
        ...dados,
        data: corrigirFuso(data),
      }
    });

    await SaldoRepo.atualizarPorTransacao(transacao, "add");
    return transacao;
  },

  async buscarPorId(id) {
    return await prisma.transacao.findUnique({ where: { id } });
  },

  async atualizar(id, dados) {
    const data = dados.data ? new Date(dados.data) : null;
    const antiga = await prisma.transacao.findUnique({ where: { id } });
    if (!antiga) throw new Error("Transação não encontrada");

    await SaldoRepo.atualizarPorTransacao(antiga, "remove");

    const transacao = await prisma.transacao.update({
      where: { id },
      data: {
        ...dados,
        data: corrigirFuso(data),
      },
    });

    await SaldoRepo.atualizarPorTransacao(transacao, "add");
    return transacao;
  },

  async deletar(id) {
    const transacao = await prisma.transacao.update({
      where: { id },
      data: { isActive: false },
    });

    await SaldoRepo.atualizarPorTransacao(transacao, "remove");
    return transacao;
  },

  async getResumo() {
    const transacoes = await prisma.transacao.findMany({
      where: { isActive: true },
      select: { tipo: true, valor: true, data: true }
    });

    let receita = 0;
    let despesa = 0;
    let receitaMensal = 0;
    let despesaMensal = 0;
    const diaFechamento = 3; //Número do dia do Fechamento, mudar a cada deploy
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = hoje.getMonth();


      if (hoje.getDate() > diaFechamento){ //IF o dia do fechamento já passou
        const inicio = new Date(ano, mes, diaFechamento + 1, 0, 0, 0, 0);
        const ultimoDiaProx = new Date(ano, mes + 2, 0).getDate();
        const fim = new Date(ano, mes + 1, Math.min(diaFechamento, ultimoDiaProx), 23, 59, 59, 999);
        for (const t of transacoes) {
          if (t.tipo === 'receita') receita += t.valor ?? 0;
          if (t.tipo === 'despesa' || t.tipo === 'despesaOperacional') despesa += t.valor ?? 0;
          if (t.tipo === 'receita' && t.data && t.data >= inicio && t.data <= fim) receitaMensal += t.valor ?? 0;
          if ((t.tipo === 'despesa' || t.tipo === 'despesaOperacional') && t.data && t.data >= inicio && t.data <= fim) despesaMensal += t.valor ?? 0;
        }
      } else if ( hoje.getDate() <= diaFechamento) { // o Dia do Fechamento ainda NÃO CHEGOU
        const ultimoDiaAnterior = new Date(ano, mes, 0).getDate();// ultimo dia mes anterior
        const diaFechamentoAnterior = Math.min(diaFechamento, ultimoDiaAnterior);
        const inicio = new Date(ano, mes - 1, diaFechamentoAnterior + 1, 0, 0, 0, 0);
        const ultimoDiaAtual = new Date(ano, mes + 1, 0).getDate();
        const fim = new Date(ano, mes, Math.min(diaFechamento, ultimoDiaAtual), 23, 59, 59, 999);
        for (const t of transacoes) {
          if (t.tipo === 'receita') receita += t.valor ?? 0;
          if (t.tipo === 'despesa' || t.tipo === 'despesaOperacional') despesa += t.valor ?? 0;
          if (t.tipo === 'receita' && t.data && t.data >= inicio && t.data <= fim) receitaMensal += t.valor ?? 0;
          if ((t.tipo === 'despesa' || t.tipo === 'despesaOperacional') && t.data && t.data >= inicio && t.data <= fim) despesaMensal += t.valor ?? 0;
        }
        }

    return {
      receitaTotal: receita,
      receitaMensal: receitaMensal,
      despesaTotal: despesa,
      despesaMensal: despesaMensal,
      fluxoLiquido: receita - despesa,
      qtdTransacoes: transacoes.length
    };
  },

};

function corrigirFuso(date) {
  if (!date) return null;
  const d = new Date(date);
  d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
  return d;
}