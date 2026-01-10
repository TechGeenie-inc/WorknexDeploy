import { PrismaClient } from '@prisma/client';
import { v4 as uuid } from 'uuid';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    const existeAdmin = await prisma.usuario.findFirst({
        where: { role: 'adminMaster' }
    });

    if (!existeAdmin) {
        console.log("Criando usuário Admin Master...");

        const senhaHash = await bcrypt.hash("admin123", 10);

        await prisma.usuario.create({
            data: {
                id: uuid(),
                nome: "Administrador de Origem",
                email: "admin@admin.com",
                senhaHash: senhaHash,
                role: "adminMaster",
                permissions: {
                    membros: { view: true, create: true, edit: true, delete: true },
                    equipes: { view: true, create: true, edit: true, delete: true },
                    funcoes: { view: true, create: true, edit: true, delete: true },
                    clientes: { view: true, create: true, edit: true, delete: true },
                    agenda: { view: true, create: true, edit: true, delete: true },
                    faturamento: { view: true, create: true, edit: true, delete: true },
                    fechamento: { view: true, create: true, edit: true, delete: true },
                    fluxoDeCaixa: { view: true, create: true, edit: true, delete: true },
                    configuracoes: { view: true, create: true, edit: true, delete: true },
                    admin: { view: true, create: true, edit: true, delete: false }
                }
            }
        });

    console.log("Usuário Admin criado!");
} else {
    console.log("Admin já existe, nada criado");
}
}

main().then(() => prisma.$disconnect()).catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
})