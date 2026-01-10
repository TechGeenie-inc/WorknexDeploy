import { ClienteRepo } from "../repositories/clienteRepo.js";
import EXCELJS from 'exceljs';
import PDFDocument from 'pdfkit';
import archiver from 'archiver';


export const ClienteController = {
  async listar(req, res) {
    try {
      const incluirInativos = req.query.inativos === 'true';
      const clientes = await ClienteRepo.buscarTodos({ incluirInativos });
      res.json(clientes);
    } catch (error) {
      console.error("Erro ao listar clientes:", error);
      res.status(500).json({ erro: "Erro ao listar clientes" });
    }
  },

  async buscar(req, res) {
    try {
      const { id } = req.params;
      const cliente = await ClienteRepo.buscarPorId(id);

      if (!cliente) return res.status(404).json({ erro: "Cliente não encontrado" });

      res.json(cliente);

    } catch (error) {

      console.error("Erro ao buscar cliente:", error);
      res.status(500).json({ erro: "Erro ao buscar cliente" });

    }
  },

  async criar(req, res) {
    try {
      const novo = await ClienteRepo.criar(req.body);
      res.status(201).json(novo);
    } catch (error) {
      console.error("Erro ao criar cliente:", error);
      res.status(500).json({ erro: "Erro ao criar cliente" });
    }
  },

  async atualizar(req, res) {
    try {
      const { id } = req.params;
      const atualizado = await ClienteRepo.atualizar(id, req.body);
      res.json(atualizado);
    } catch (error) {
      console.error("Erro ao atualizar cliente:", error);
      res.status(500).json({ erro: "Erro ao atualizar cliente" });
    }
  },

  async deletar(req, res) {
    try {
      const { id } = req.params;
      await ClienteRepo.deletar(id);
      res.json({ mensagem: `Cliente ${id} marcado como inativo.` });
    } catch (error) {
      console.error("Erro ao deletar cliente:", error);
      res.status(500).json({ erro: "Erro ao deletar cliente" });
    }
  },

  async exportar(req, res) {
    try {

      const incluirInativos = req.query.inativos === 'true';
      const clientes = await ClienteRepo.buscarTodos({ incluirInativos });

      res.setHeader("Content-Type", "application/zip");
      res.setHeader("Content-Disposition", "attachment; filename=clientes.zip");

      const archive = archiver("zip", { zlib: { level: 9 } });
      archive.pipe(res);

      const workbook = new EXCELJS.Workbook();
      const sheet = workbook.addWorksheet("Clientes");

      sheet.columns = [
        { header: "Nome", key: "nome", width: 30 },
        { header: "Nome Fantasia", key: "nomeFantasia", width: 30 },
        { header: "Razão Social", key: "razaoSocial", width: 30 },
        { header: "CNPJ", key: "cnpj", width: 30 },
        { header: "CPF", key: "cpf", width: 30 },
        { header: "Email", key: "email", width: 30 },
        { header: "Telefone", key: "telefone", width: 20 },
        { header: "Endereço", key: "endereco", width: 30 },
      ];

      clientes.forEach(c => {
        sheet.addRow({
          nome: c.nomeCompleto,
          email: c.email,
          telefone: c.contato,
          nomeFantasia: c.nomeFantasia,
          endereco: c.enderecoCompleto,
          razaoSocial: c.razaoSocial,
          cnpj: c.cnpj,
          cpf: c.cpf,
        });
      });

      const xlsBuffer = await workbook.xlsx.writeBuffer();
      archive.append(xlsBuffer, { name: "clientes.xlsx" });

      const pdfDoc = new PDFDocument();
      const pdfChunks = [];
      pdfDoc.on("data", chunk => pdfChunks.push(chunk));
      pdfDoc.on("end", () => {
        const pdfBuffer = Buffer.concat(pdfChunks);
        archive.append(pdfBuffer, { name: "clientes.pdf" });
        archive.finalize();
      });

      pdfDoc.text("Lista de Clientes\n\n");
      clientes.forEach(c => {
        pdfDoc.text(`${c.nomeCompleto} - ${c.email}`);
      });

      pdfDoc.end();
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Erro ao exportar XLS" });
    }

  }
};
