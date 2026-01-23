import { MembroRepo } from "../repositories/membroRepo.js";
import EXCELJS from 'exceljs';
import PDFDocument from 'pdfkit';
import archiver from 'archiver';

export const MembroController = {
    async listar(req, res) {
        try {
            const incluirInativos = req.query.inativos === 'true';
            const membros = await MembroRepo.buscarTodos({ incluirInativos });
            res.json(membros);
        } catch (error) {
            console.error("Erro ao listar membros, ", error);
            res.status(500).json({ erro: "Erro ao listar membros" });
        }
    },

    async buscar(req, res) {
        try {
            const { id } = req.params;
            const membro = await MembroRepo.buscarPorId(id);

            if (!membro) {
                return res.status(404).json({ erro: "Membro não encontrado" });
            }
            res.json(membro);
        } catch (error) {
            console.error("Nao foi possivel buscar esse membro, ", error);
            res.status(500).json({ erro: "Erro ao buscar membro" })
        }
    },

    async criar(req, res) {
        try {
            const novo = await MembroRepo.criar(req.body);
            res.status(201).json(novo);
        } catch (error) {
            console.error("Erro ao criar membro, ", error);
            res.status(error.status || 500).json({ erro: error.message || "Erro ao criar membro" });
        }
    },

    async atualizar(req, res) {
        try {
            const { id } = req.params;
            const atualizado = await MembroRepo.atualizar(id, req.body);
            res.json(atualizado);
        } catch (error) {
            console.error("Erro ao atualizar o membro, ", error);
            res.status(500).json({ erro: "Erro ao atualizar membro" });
        }
    },

    async deletar(req, res) {
        try {
            const { id } = req.params;
            await MembroRepo.deletar(id);
            res.json({ mensagem: `O Membro ${id} foi marcado como inativo.` });
        } catch (error) {
            console.error("Erro ao deletar membro, ", error);
            res.status(500).json({ erro: "Impossivel deletar membro" });
        }
    },

    async exportar(req, res) {
        try {
            const incluirInativos = req.query.inativos === 'true';
            const membros = await MembroRepo.buscarTodos({ incluirInativos });

            res.setHeader("Content-Type", "application/zip");
            res.setHeader("Content-Disposition", "attachment; filename=membros.zip");

            const archive = archiver("zip", { zlib: { level: 9 } });
            archive.pipe(res);

            const workbook = new EXCELJS.Workbook();
            const sheet = workbook.addWorksheet("Membros");

            sheet.columns = [
                { header: "Nome", key: "nome", width: 30 },
                { header: "CPF", key: "cpf", width: 30 },
                { header: "Função", key: "funcao", width: 30 },
                { header: "Contato", key: "contato", width: 30 },
                { header: "Valor/Hora", key: "valorHora", width: 30 },
                { header: "Valor/Venda", key: "valorVenda", width: 30 },
            ];

            membros.forEach(m => {
                sheet.addRow({
                    nome: m.nome,
                    cpf: m.cpf,
                    funcao: m.funcao.nomeFuncao,
                    contato: m.contato,
                    valorHora: m.precoHora,
                    valorVenda: m.precoVenda,
                });
            });

            const xlsBuffer = await workbook.xlsx.writeBuffer();
            archive.append(xlsBuffer, { name: "membros.xlsx" });

            const pdfDoc = new PDFDocument();
            const pdfChunks = [];
            pdfDoc.on("data", chunk => pdfChunks.push(chunk));
            pdfDoc.on("end", () => {
                const pdfBuffer = Buffer.concat(pdfChunks);
                archive.append(pdfBuffer, { name: "membros.pdf" });
                archive.finalize();
            });

            pdfDoc.text("Lista de Membros\n\n");
            membros.forEach(m => {
                pdfDoc.text(`${m.nome} - ${m.cpf} - ${m.funcao.nomeFuncao} - ${m.contato} - ${m.precoHora} - ${m.precoVenda}`);
            });

            pdfDoc.end();
        } catch (e) {
            console.error(e);
            res.status(500).json({ erro: "Erro ao exportar XLS" });
        }

    }


}