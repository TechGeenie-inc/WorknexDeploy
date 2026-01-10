import prisma from '../database/prismaClient.js';

export const SistemaController = {
    async exportar(req, res) {
        try {
            const data = {
                config: await prisma.config.findMany(),
                clientes: await prisma.cliente.findMany(),
                funcoes: await prisma.funcao.findMany(),
                membros: await prisma.membro.findMany(),
                equipes: await prisma.equipe.findMany({
                    include: {
                        participacaoMembros: true,
                        membros: true,
                        fechamento: true,
                        evento: true
                    }
                }),
                participacoes: await prisma.participacaoMembro.findMany(),
                fechamentos: await prisma.fechamento.findMany(),
                fechamentoMembros: await prisma.fechamentoMembro.findMany(),
                faturas: await prisma.fatura.findMany(),
                eventos: await prisma.evento.findMany(),
                transacoes: await prisma.transacao.findMany(),
                saldo: await prisma.saldo.findMany()
            };

            res.setHeader("Content-Disposition", 'attachment; filename="backup.json"');
            res.setHeader("Content-Type", "application/json");
            res.send(JSON.stringify(data, null, 2));
        } catch (err) {
            console.error("Erro ao exportar:", err);
            res.status(500).json({ erro: "Erro ao exportar dados" });
        }
    },

    async importar(req, res) {
        try {
            if (!req.file)
                return res.status(400).json({ erro: "Arquivo JSON não enviado" });

            const dados = JSON.parse(req.file.buffer.toString());

            if (dados.clientes) await prisma.cliente.createMany({ data: dados.clientes });
            if (dados.funcoes) await prisma.funcao.createMany({ data: dados.funcoes });
            if (dados.membros) await prisma.membro.createMany({ data: dados.membros });

            if (dados.equipes) {
                for (const e of dados.equipes) {

                    await prisma.equipe.create({
                        data: {
                            id: e.id,
                            nomeEquipe: e.nomeEquipe,
                            clienteSelecionado: e.clienteSelecionado,
                            dataInicio: e.dataInicio,
                            dataFinal: e.dataFinal,
                            tarefa: e.tarefa,
                            status: e.status,
                            isActive: e.isActive,
                            clienteId: e.clienteId,

                            membros: {
                                connect: e.membros?.map(m => ({ id: m.id })) ?? []
                            },

                            participacaoMembros: {
                                create: e.participacaoMembros?.map(pm => ({
                                    id: pm.id,
                                    membroId: pm.membroId,
                                    dataInicio: pm.dataInicio,
                                    dataFim: pm.dataFim
                                })) ?? []
                            },

                            evento: e.evento ? {
                                create: {
                                    id: e.evento.id,
                                    title: e.evento.title,
                                    start: e.evento.start,
                                    end: e.evento.end,
                                    allDay: e.evento.allDay,
                                    isActive: e.evento.isActive,
                                    color: e.evento.color
                                }
                            } : undefined
                        }
                    });
                }
            }


            if (dados.fechamentos) {
                for (const f of dados.fechamentos) {
                    await prisma.fechamento.create({
                        data: {
                            id: f.id,
                            equipeId: f.equipeId,
                            dataFechamento: f.dataFechamento,
                            horasTotais: f.horasTotais,
                            obs: f.obs,
                            valorTotal: f.valorTotal,
                            status: f.status,
                            isActive: f.isActive,
                            criadoEm: f.criadoEm,
                            atualizadoEm: f.atualizadoEm
                        }
                    })
                }
            }


            if (dados.fechamentoMembros)
                await prisma.fechamentoMembro.createMany({ data: dados.fechamentoMembros });

            if (dados.faturas)
                await prisma.fatura.createMany({ data: dados.faturas });

            if (dados.eventos) {
                const idsExistentes = new Set(
                    (await prisma.evento.findMany({ select: { id: true } }))
                        .map(e => e.id)
                );

                const novosEventos = dados.eventos.filter(e => !idsExistentes.has(e.id));

                if (novosEventos.length > 0) {
                    await prisma.evento.createMany({ data: novosEventos });
                }
            }


            if (dados.transacoes)
                await prisma.transacao.createMany({ data: dados.transacoes });

            if (dados.saldo?.length > 0) {
                const s = dados.saldo[0];
                await prisma.saldo.upsert({
                    where: { id: 1 },
                    update: { total: s.total, atualizadoEm: s.atualizadoEm },
                    create: s
                });
            }


            res.json({ msg: "Importação concluída!" });

        } catch (err) {
            console.error("Erro ao importar:", err);
            res.status(500).json({ erro: "Erro ao importar dados" });
        }
    },

    async limpar(req, res) {
        try {
            await prisma.fechamentoMembro.deleteMany();
            await prisma.participacaoMembro.deleteMany();
            await prisma.fatura.deleteMany();
            await prisma.fechamento.deleteMany();
            await prisma.evento.deleteMany();
            await prisma.transacao.deleteMany();
            await prisma.equipe.deleteMany();
            await prisma.membro.deleteMany();
            await prisma.funcao.deleteMany();
            await prisma.cliente.deleteMany();
            await prisma.saldo.deleteMany();

            res.json({ msg: "Todos os dados foram removidos." });

        } catch (err) {
            console.error("Erro ao limpar:", err);
            res.status(500).json({ erro: "Erro ao limpar dados" });
        }
    }
}