import { FuncaoRepo } from "../repositories/funcaoRepo.js";
import EXCELJS from 'exceljs';
import PDFDocument from 'pdfkit';
import archiver from 'archiver';

export const FuncaoController = {
    async listar(req, res) {
        try {
            const incluirInativos = req.query.inativos === 'true';
            const funcoes = await FuncaoRepo.buscarTodos({ incluirInativos });
            res.json(funcoes);
        } catch (error) {
            console.error("Erro ao listar funcoes", error);
            res.status(500).json({ erro: 'Erro ao listar funcoes' });
        }
    },

    async buscar(req, res) {
        try {
            const { id } = req.params;
            const funcao = await FuncaoRepo.buscarPorId(id);

            if (!funcao) {
                return res.status(404).json({ erro: 'Funcao nao encontrado' });
            }

            res.json(funcao);
        } catch (error) {
            console.error("Nao foi possivel buscar essa funcao", error);
            res.status(500).json({ erro: 'Impossivel buscar essa funcao' });
        }
    },

    async criar(req, res) {
        try {
            const novo = await FuncaoRepo.criar(req.body);
            res.status(201).json(novo);
        } catch (error) {
            console.error("Erro ao criar funcao", error);
            res.status(500).json({ erro: 'Impossivel criar essa funcao' });
        }
    },

    async atualizar(req, res) {
        try {
            const { id } = req.params;
            const atualizado = await FuncaoRepo.atualizar(id, req.body);
            res.json(atualizado);
        } catch (error) {
            console.error("Erro ao atualizar funcao, ", error);
            res.status(500).json({ erro: 'Erro ao atualizar funcao' });
        }
    },

    async deletar(req, res) {
        try {
            const { id } = req.params;
            await FuncaoRepo.deletar(id);
            res.json({ mensagem: `A funcao ${id} foi deletado` });
        } catch (error) {
            console.error("Erro ao deletar funcao, ", error);
            res.status(500).json({ erro: "Impossivel atualizar essa funcao" })
        }
    },

    async exportar(req, res) {
        try {

            const incluirInativos = req.query.inativos === 'true';
            const funcoes = await FuncaoRepo.buscarTodos({ incluirInativos });

            res.setHeader("Content-Type", "application/zip");
            res.setHeader("Content-Disposition", "attachment; filename=funcoes.zip");

            const archive = archiver("zip", { zlib: { level: 9 } });
            archive.pipe(res);

            const workbook = new EXCELJS.Workbook();
            const sheet = workbook.addWorksheet("Funcoes");

            sheet.columns = [
                { header: "Nome", key: "nome", width: 30 },
            ];

            funcoes.forEach(f => {
                sheet.addRow({
                    nome: f.nomeFuncao,
                });
            });

            const xlsBuffer = await workbook.xlsx.writeBuffer();
            archive.append(xlsBuffer, { name: "funcoes.xlsx" });

            const pdfDoc = new PDFDocument();
            const pdfChunks = [];
            pdfDoc.on("data", chunk => pdfChunks.push(chunk));
            pdfDoc.on("end", () => {
                const pdfBuffer = Buffer.concat(pdfChunks);
                archive.append(pdfBuffer, { name: "funcoes.pdf" });
                archive.finalize();
            });

            pdfDoc.text("Lista de Funcoes\n\n");
            funcoes.forEach(f => {
                pdfDoc.text(`${f.nomeFuncao}`);
            });

            pdfDoc.end();
        } catch (e) {
            console.error(e);
            res.status(500).json({ erro: "Erro ao exportar XLS" });
        }

    }
}