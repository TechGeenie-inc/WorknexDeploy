import { EquipeRepo } from '../repositories/equipeRepo.js';
import EXCELJS from 'exceljs';
import PDFDocument from 'pdfkit';
import archiver from 'archiver';

export const EquipeController = {
    async listar(req, res) {
        try {
            const incluirInativos = req.query.inativos === 'true';
            const equipes = await EquipeRepo.buscarTodos({ incluirInativos });
            res.json(equipes);
        } catch (error) {
            console.error("Nao foi possivel listar as equipes, ", error);
            res.status(500).json({ erro: "Erro ao listar clientes" });
        }
    },

    async buscar(req, res) {
        try {
            const { id } = req.params;
            const equipe = await EquipeRepo.buscarPorId(id);
            if (!equipe) return res.status(404).json({ erro: "Equipe nao existe no banco de dados" });
            res.json(equipe);
        } catch (error) {
            console.error("Nao foi possivel encontrar a equipe, ", erro);
            res.status(500).json({ erro: "Erro ao buscar equipe" });
        }
    },

    async criar(req, res) {
        try {
            const novo = await EquipeRepo.criar(req.body);
            res.status(201).json(novo);
        } catch (error) {
            console.error("Nao foi possivel criar a nova equipe, ", error);

            res.status(error.status || 500).json({ erro: error.message || "Erro ao criar equipe" });
        }
    },

    async atualizar(req, res) {
        try {
            const { id } = req.params;
            const atualizado = await EquipeRepo.atualizar(id, req.body);
            res.status(201).json(atualizado);
        } catch (error) {
            console.log("Nao foi possivel atualizar a equipe, ", error);
            res.status(500).json({ erro: "Erro ao atualizar a equipe" });
        }
    },

    async deletar(req, res) {
        try {
            const { id } = req.params;
            await EquipeRepo.deletar(id);
            res.json({ mensagem: `Equipe de ID ${id} deletada com sucesso` });
        } catch (error) {
            console.error("Nao foi possivel deletar a equipe, ", error);
            res.status(500).json({ erro: "Erro ao deletar a equipe" });
        }
    },

    async atualizarStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            const atualizado = await EquipeRepo.atualizarStatus(id, status);
            res.status(201).json(atualizado);
        } catch (error) {
            console.log("Nao foi possivel atualizar p status da equipe, ", error);
            res.status(500).json({ erro: "Erro ao atualizar o status da equipe" });
        }
    },

    async exportar(req, res) {
        try {

            const incluirInativos = req.query.inativos === 'true';
            const equipes = await EquipeRepo.buscarTodos({ incluirInativos });

            res.setHeader("Content-Type", "application/zip");
            res.setHeader("Content-Disposition", "attachment; filename=equipes.zip");

            const archive = archiver("zip", { zlib: { level: 9 } });
            archive.pipe(res);

            const workbook = new EXCELJS.Workbook();
            const sheet = workbook.addWorksheet("Equipes");

            sheet.columns = [
                { header: "Nome", key: "nome", width: 30 },
                { header: "Cliente", key: "cliente", width: 30 },
                { header: "Tarefa", key: "tarefa", width: 30 },
                { header: "Data de início", key: "dataInicio", width: 30 },
                { header: "Data de finalização", key: "dataFinal", width: 30 },
            ];

            equipes.forEach(e => {
                sheet.addRow({
                    nome: e.nomeEquipe,
                    cliente: e.cliente.nomeCompleto ?? e.cliente.razaoSocial ?? e.cliente.nomeFantasia,
                    tarefa: e.tarefa,
                    dataInicio: e.dataInicio,
                    dataFinal: e.dataFinal,
                });
            });

            const xlsBuffer = await workbook.xlsx.writeBuffer();
            archive.append(xlsBuffer, { name: "equipes.xlsx" });

            const pdfDoc = new PDFDocument();
            const pdfChunks = [];
            pdfDoc.on("data", chunk => pdfChunks.push(chunk));
            pdfDoc.on("end", () => {
                const pdfBuffer = Buffer.concat(pdfChunks);
                archive.append(pdfBuffer, { name: "equipes.pdf" });
                archive.finalize();
            });

            pdfDoc.text("Lista de Equipes\n\n");
            equipes.forEach(e => {
                pdfDoc.text(`${e.nomeEquipe} - ${e.cliente.nomeCompleto ?? e.cliente.razaoSocial ?? e.cliente.nomeFantasia}`);
            });

            pdfDoc.end();
        } catch (e) {
            console.error(e);
            res.status(500).json({ erro: "Erro ao exportar XLS" });
        }

    }
}