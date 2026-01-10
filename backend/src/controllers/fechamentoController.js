import { FechamentoRepo } from '../repositories/fechamentoRepo.js';
import EXCELJS from 'exceljs';
import PDFDocument from 'pdfkit';
import archiver from 'archiver';
import prisma from '../database/prismaClient.js';

export const FechamentoController = {
    async listar(req, res) {
        try {
            const incluirInativos = req.query.inativos === 'true';
            const fechamentos = await FechamentoRepo.buscarTodos({ incluirInativos });
            res.json(fechamentos)
        } catch (error) {
            console.error("Nao foi possivel listar os fechamentos, ", error);
            res.status(500).json({ erro: "Erro ao listar fechamentos" })
        }
    },

    async buscar(req, res) {
        try {
            const { id } = req.params;
            const fechamento = await FechamentoRepo.buscarPorId(id);

            if (!fechamento) {
                return res.status(404).json({ erro: "fechamento não encontrado" });
            }

            res.json(fechamento);
        } catch (error) {
            console.error("Erro ao buscar fechamento:", error);
            res.status(500).json({ erro: "Erro ao buscar fechamento" });
        }
    },

    async criar(req, res) {
        try {
            const novo = await FechamentoRepo.criar(req.body);
            res.status(201).json(novo);
        } catch (error) {
            console.error("Erro ao criar fechamento:", error);
            res.status(500).json({ erro: "Erro ao criar fechamento" });
        }
    },

    async atualizar(req, res) {
        try {
            const { id } = req.params;
            const atualizado = await FechamentoRepo.atualizar(id, req.body);
            res.json(atualizado);
        } catch (error) {
            console.error("Erro ao atualizar fechamento:", error);
            res.status(500).json({ erro: "Erro ao atualizar fechamento" });
        }
    },

    async deletar(req, res) {
        try {
            const { id } = req.params;
            await FechamentoRepo.deletar(id);
            res.json({ mensagem: `fechamento ${id} marcado como inativo.` });
        } catch (error) {
            console.error("Erro ao deletar fechamento:", error);
            res.status(500).json({ erro: "Erro ao deletar fechamento" });
        }
    },

    async updateExport(req, res) {
        try {
            const { id } = req.params;
            const { export: exportFlag } = req.body;
            const atualizado = await FechamentoRepo.updateExport(id, exportFlag);

            res.json(atualizado);
        } catch (error) {
            console.error("Erro ao atualizar fechamento:", error);
            res.status(500).json({ Erro: "Erro ao atualizar o export do fechamento" });
        }
    },

    async resetExport(req, res) {
        try {
            await FechamentoRepo.resetExports();
            res.json({ ok: true });
        } catch (err) {
            console.error(err);
            res.status(500).json({ erro: 'Erro ao resetar export' });
        }
    },

    async exportar(req, res) {
        try {
            const fechamentos = await FechamentoRepo.findExports();
            const config = await prisma.config.findFirst();

            res.setHeader("Content-Type", "application/zip");
            res.setHeader("Content-Disposition", "attachment; filename=fechamentos.zip");

            const archive = archiver("zip", { zlib: { level: 9 } });
            archive.pipe(res);

            const workbook = new EXCELJS.Workbook();
            const sheet = workbook.addWorksheet("Fechamentos");

            sheet.columns = [
                { header: "Nome", key: "nome", width: 30 },
                { header: "Cliente", key: "cliente", width: 30 },
                { header: "Tarefa", key: "tarefa", width: 30 },
                { header: "Data de início Equipe", key: "dataInicio", width: 30 },
                { header: "Data de finalização Equipe", key: "dataFinal", width: 30 },
                { header: "Data do Fechamento", key: "dataFechamento", width: 30 },
                { header: "Horas totais", key: "horasTotais", width: 30 },
                { header: "Valor Total", key: "valorTotal", width: 30 },
            ];

            fechamentos.forEach(f => {
                sheet.addRow({
                    nome: f.equipe.nomeEquipe,
                    cliente: f.equipe.cliente.nomeCompleto ?? f.equipe.cliente.razaoSocial ?? f.equipe.cliente.nomeFantasia,
                    tarefa: f.equipe.tarefa,
                    dataInicio: f.equipe.dataInicio,
                    dataFinal: f.equipe.dataFinal,
                    dataFechamento: f.dataFechamento,
                    horasTotais: f.horasTotais,
                    valorTotal: f.valorTotal,
                });
            });

            const xlsBuffer = await workbook.xlsx.writeBuffer();
            archive.append(xlsBuffer, { name: "fechamentos.xlsx" });

            for (const fechamento of fechamentos) {
                const pdfBuffer = await gerarPdfFechamento(fechamento, config);
                const nomeArquivo = `fechamento_${fechamento.equipe.nomeEquipe.replace(/\s+/g, '_')}.pdf`;
                archive.append(pdfBuffer, {
                    name: nomeArquivo
                });
            }

            await archive.finalize();

        } catch (e) {
            console.error(e);
            res.status(500).json({ error: "Erro ao exportar XLS" });
        }

    }

}

function gerarPdfFechamento(fechamento, config) {
    return new Promise((resolve) => {
        const doc = new PDFDocument({ margin: 40 });
        const chunks = [];

        doc.on("data", chunk => chunks.push(chunk));
        doc.on("end", () => resolve(Buffer.concat(chunks)));

        doc.fontSize(16).text("Fechamento de Projeto", { align: "center" });
        doc.moveDown();

        doc.fontSize(12).text(`Equipe: ${fechamento.equipe.nomeEquipe}`);
        doc.text(`Cliente: ${fechamento.equipe.cliente.nomeCompleto ??
            fechamento.equipe.cliente.razaoSocial ??
            fechamento.equipe.cliente.nomeFantasia
            }`);
        doc.text(`Período: ${fechamento.equipe.dataInicio.toLocaleDateString()} - ${fechamento.equipe.dataFinal.toLocaleDateString()}`);
        doc.text(`Data do fechamento: ${fechamento.dataFechamento.toLocaleDateString()}`);
        doc.moveDown();

        doc.text(`Horas totais: ${fechamento.horasTotais}`);
        doc.text(`Valor total: R$ ${fechamento.valorTotal.toFixed(2)}`);
        doc.moveDown();

        if (fechamento.obs) {
            doc.text(`Observações: ${fechamento.obs}`);
            doc.moveDown();
        }

        doc.text("Membros:", { underline: true });
        fechamento.membrosFechados.forEach(m => {
            doc.text(`- ${m.membro.nome}`);
        });

        const dadosEmpresa = config ? [
            config.nomeDaEmpresa && `Nome: ${config.nomeDaEmpresa}`,
            config.email && `Email: ${config.email}`,
            config.cnpj && `CNPJ: ${config.cnpj}`,
            config.razaoSocial && `Razão Social: ${config.razaoSocial}`,
            config.inscricaoEstadual && `IE: ${config.inscricaoEstadual}`
        ].filter(Boolean) : [];

        doc.moveDown();
        if (dadosEmpresa.length) {
            doc.text(`Dados da empresa: ${dadosEmpresa.join(' | ')}`);
        }

        doc.end();
    });
}
