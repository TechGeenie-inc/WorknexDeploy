import { FaturaRepo } from "../repositories/faturaRepo.js";
import EXCELJS from 'exceljs';
import PDFDocument from 'pdfkit';
import archiver from 'archiver';

export const FaturaController = {
  async listar(req, res) {
    try {
      const incluirInativos = req.query.inativos === 'true';
      await FaturaRepo.verificarVencidas();
      const faturas = await FaturaRepo.buscarTodos({ incluirInativos });
      res.json(faturas);
    } catch (error) {
      console.error("Erro ao listar faturas:", error);
      res.status(500).json({ erro: "Erro ao listar faturas" });
    }
  },

  async buscar(req, res) {
    try {
      const { id } = req.params;
      const fatura = await FaturaRepo.buscarPorId(id);

      if (!fatura) {
        return res.status(404).json({ erro: "Fatura não encontrada" });
      }

      res.json(fatura);
    } catch (error) {
      console.error("Erro ao buscar fatura:", error);
      res.status(500).json({ erro: "Erro ao buscar fatura" });
    }
  },

  async criar(req, res) {
    try {
      const novo = await FaturaRepo.criar(req.body);
      res.status(201).json(novo);
    } catch (error) {
      console.error("Erro ao criar fatura:", error);
      res.status(500).json({ erro: "Erro ao criar fatura" });
    }
  },

  async atualizar(req, res) {
    try {
      const { id } = req.params;
      const atualizado = await FaturaRepo.atualizar(id, req.body);
      res.json(atualizado);
    } catch (error) {
      console.error("Erro ao atualizar fatura:", error);
      res.status(500).json({ erro: "Erro ao atualizar fatura" });
    }
  },

  async deletar(req, res) {
    try {
      const { id } = req.params;
      await FaturaRepo.deletar(id);
      res.json({ mensagem: `Fatura ${id} marcado como inativo.` });
    } catch (error) {
      console.error("Erro ao deletar fatura:", error);
      res.status(500).json({ erro: "Erro ao deletar fatura" });
    }
  },

  async atualizarStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const atualizado = await FaturaRepo.atualizarStatus(id, status);
      res.status(201).json(atualizado);
    } catch (error) {
      console.log("Nao foi possivel atualizar o status da fatura, ", error);
      res.status(500).json({ erro: "Erro ao atualizar o status da fatura" });
    }
  },

  async exportar(req, res) {
    try {

      const incluirInativos = req.query.inativos === 'true';
      const faturas = await FaturaRepo.buscarTodos({ incluirInativos });

      res.setHeader("Content-Type", "application/zip");
      res.setHeader("Content-Disposition", "attachment; filename=faturas.zip");

      const archive = archiver("zip", { zlib: { level: 9 } });
      archive.pipe(res);

      const workbook = new EXCELJS.Workbook();
      const sheet = workbook.addWorksheet("Faturas");

      sheet.columns = [
        { header: "Nome do Cliente", key: "nome", width: 30 },
        { header: "Forma de pagamento", key: "formaPagamento", width: 30 },
        { header: "Valor Total", key: "valorTotal", width: 30 },
        { header: "Vencimento", key: "vencimento", width: 30 },
      ];


      faturas.forEach(f => {
        if (f.formaPagamento === "pix") {
          sheet.addRow({
            nome: f.clienteNome,
            formaPagamento: "Pix",
            valorTotal: f.valorTotal,
            vencimento: f.vencimento,
          });
        } else if (f.formaPagamento === "transferenciaBancaria") {
          sheet.addRow({
            nome: f.clienteNome,
            formaPagamento: "Transferência Bancária",
            valorTotal: f.valorTotal,
            vencimento: f.vencimento,
          });
        } else if (f.formaPagamento === "boletoBancario") {
          sheet.addRow({
            nome: f.clienteNome,
            formaPagamento: "Boleto Bancário",
            valorTotal: f.valorTotal,
            vencimento: f.vencimento,
          });
        } else if (f.formaPagamento === "cartaoDeCredito") {
          sheet.addRow({
            nome: f.clienteNome,
            formaPagamento: "Cartão de Crédito",
            valorTotal: f.valorTotal,
            vencimento: f.vencimento,
          });
        }
      });

      const xlsBuffer = await workbook.xlsx.writeBuffer();
      archive.append(xlsBuffer, { name: "faturas.xlsx" });

      const pdfDoc = new PDFDocument();
      const pdfChunks = [];
      pdfDoc.on("data", chunk => pdfChunks.push(chunk));
      pdfDoc.on("end", () => {
        const pdfBuffer = Buffer.concat(pdfChunks);
        archive.append(pdfBuffer, { name: "faturas.pdf" });
        archive.finalize();
      });

      pdfDoc.text("Lista de Faturas\n\n");
      faturas.forEach(f => {
        if (f.formaPagamento === "pix") {
          pdfDoc.text(`${f.clienteNome} - Pix - ${f.valorTotal} - ${f.vencimento}`);
        } else if (f.formaPagamento === "transferenciaBancaria") {
          pdfDoc.text(`${f.clienteNome} - Transferência Bancária - ${f.valorTotal} - ${f.vencimento}`);
        } else if (f.formaPagamento === "boletoBancario") {
          pdfDoc.text(`${f.clienteNome} - Boleto Bancário - ${f.valorTotal} - ${f.vencimento}`);
        } else if (f.formaPagamento === "cartaoDeCredito") {
          pdfDoc.text(`${f.clienteNome} - Cartão de Crédito - ${f.valorTotal} - ${f.vencimento}`);
        }
      });

      pdfDoc.end();
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Erro ao exportar XLS" });
    }

  }

};
