import { TransacaoRepo } from "../repositories/transacaoRepo.js";
import EXCELJS from 'exceljs';
import PDFDocument from 'pdfkit';
import archiver from 'archiver';

export const TransacaoController = {
    async listar(req, res) {
        try {
            const incluirInativos = req.query.inativos === 'true';
            const transacoes = await TransacaoRepo.buscarTodos({ incluirInativos });
            res.json(transacoes);
        } catch (error) {
            console.error("Erro ao listar transacoes:", error);
            res.status(500).json({ erro: "Erro ao listar transacoes" });
        }
    },

    async buscar(req, res) {
        try {
            const { id } = req.params;
            const transacao = await TransacaoRepo.buscarPorId(id);

            if (!transacao) {
                return res.status(404).json({ erro: "Transacao não encontrada" });
            }

            res.json(transacao);
        } catch (error) {
            console.error("Erro ao buscar transacao:", error);
            res.status(500).json({ erro: "Erro ao buscar transacao" });
        }
    },

    async criar(req, res) {
        try {
            const novo = await TransacaoRepo.criar(req.body);
            res.status(201).json(novo);
        } catch (error) {
            console.error("Erro ao criar transacao:", error);
            res.status(500).json({ erro: "Erro ao criar transacao" });
        }
    },

    async atualizar(req, res) {
        try {
            const { id } = req.params;
            const atualizado = await TransacaoRepo.atualizar(id, req.body);
            res.json(atualizado);
        } catch (error) {
            console.error("Erro ao atualizar transacao:", error);
            res.status(500).json({ erro: "Erro ao atualizar transacao" });
        }
    },

    async deletar(req, res) {
        try {
            const { id } = req.params;
            await TransacaoRepo.deletar(id);
            res.json({ mensagem: `Transacao ${id} marcado como inativo.` });
        } catch (error) {
            console.error("Erro ao deletar transacao:", error);
            res.status(500).json({ erro: "Erro ao deletar transacao" });
        }
    },

    async resumo(req, res) {
        try {
            const resumo = await TransacaoRepo.getResumo();
            res.json(resumo);
        } catch (error) {
            console.error(error);
            res.status(500).json({ erro: "Erro ao pegar resumo de transacoes" });
        }
    },

    async exportar(req, res) {
        try {

            const incluirInativos = req.query.inativos === 'true';
            const transacoes = await TransacaoRepo.buscarTodos({ incluirInativos });

            res.setHeader("Content-Type", "application/zip");
            res.setHeader("Content-Disposition", "attachment; filename=transacoes.zip");

            const archive = archiver("zip", { zlib: { level: 9 } });
            archive.pipe(res);

            const workbook = new EXCELJS.Workbook();
            const sheet = workbook.addWorksheet("Transacoes");

            sheet.columns = [
                { header: "Tipo", key: "tipo", width: 30 },
                { header: "Categoria", key: "categoria", width: 30 },
                { header: "Subcategoria", key: "subcategoria", width: 30 },
                { header: "Descrição", key: "desc", width: 30 },
                { header: "Valor", key: "valor", width: 30 },
                { header: "Data", key: "data", width: 30 },
            ];

            transacoes.forEach(t => {
                sheet.addRow({
                    tipo: t.tipo,
                    categoria: t.categoria,
                    subcategoria: t.subcategoria,
                    desc: t.desc,
                    valor: t.valor,
                    data: t.data,
                });
            });

            const xlsBuffer = await workbook.xlsx.writeBuffer();
            archive.append(xlsBuffer, { name: "transacoes.xlsx" });

            const pdfDoc = new PDFDocument();
            const pdfChunks = [];
            pdfDoc.on("data", chunk => pdfChunks.push(chunk));
            pdfDoc.on("end", () => {
                const pdfBuffer = Buffer.concat(pdfChunks);
                archive.append(pdfBuffer, { name: "transacoes.pdf" });
                archive.finalize();
            });

            pdfDoc.text("Lista de Transações\n\n");
            transacoes.forEach(t => {
                pdfDoc.text(`${t.tipo} - ${t.categoria} - ${t.subcategoria} - ${t.desc} - ${t.valor} - ${t.data}`);
            });

            pdfDoc.end();
        } catch (e) {
            console.error(e);
            res.status(500).json({ error: "Erro ao exportar XLS" });
        }

    }
}