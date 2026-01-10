import cron from "node-cron";
import prisma from "../database/prismaClient.js";
import fs from "fs";
import { enviarEmail } from "../utils/email.js";

const ADMIN_EMAIL = "falecom@worknex.tech";

async function gerarBackupJSON() {
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

    const filePath = `./backup-${Date.now()}.json`;
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

    return filePath;
}

async function enviarBackupMensal() {
    const filePath = await gerarBackupJSON();

    await enviarEmail(
        ADMIN_EMAIL,
        "Backup mensal do sistema",
        "<p>Segue o backup mensal do sistema.</p>",
        [
            {
                filename: "backup.json",
                path: filePath
            }
        ]
    );

    fs.unlinkSync(filePath); 
}

cron.schedule("0 10 1 * *", async () => {
    try {
        await enviarBackupMensal();
    } catch (err) {
        console.error("[CRON ERROR] Falha ao enviar backup mensal:", err);
    }
});
