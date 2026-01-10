
import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import prisma from './src/database/prismaClient.js';
import clienteRoutes from './src/routes/clienteRoutes.js';
import membroRoutes from './src/routes/membroRoutes.js';
import funcaoRoutes from './src/routes/funcaoRoutes.js';
import equipeRoutes from './src/routes/equipeRoutes.js';
import fechamentoRoutes from './src/routes/fechamentoRoutes.js';
import faturaRoutes from './src/routes/faturaRoutes.js';
import eventoRoutes from './src/routes/eventoRoutes.js';
import saldoRoutes from './src/routes/saldoRoutes.js';
import transacaoRoutes from './src/routes/transacaoRoutes.js';
import authRoutes from './src/routes/authRoutes.js';
import configRoutes from './src/routes/configRoutes.js';
import changeRequestRoutes from './src/routes/changeRequestRoutes.js';
import sistemaRoutes from './src/routes/sistemaRoutes.js';
import configVisualRoutes from './src/routes/configVisuaisRoutes.js';

import "./src/utils/backupCron.js";
const app = express();
app.use(express.json());
app.use(cors());

app.use('/clientes', clienteRoutes);
app.use('/membros', membroRoutes);
app.use('/funcoes', funcaoRoutes);
app.use('/equipes', equipeRoutes);
app.use('/fechamentos', fechamentoRoutes);
app.use('/faturas', faturaRoutes);
app.use('/eventos', eventoRoutes);
app.use('/transacoes', transacaoRoutes);
app.use('/saldo', saldoRoutes);
app.use('/auth', authRoutes);
app.use('/config', configRoutes);
app.use('/change-request', changeRequestRoutes);
app.use('/sistema', sistemaRoutes);
app.use('/config-visual', configVisualRoutes);

async function testarConexao() {
    try {
        await prisma.$connect();
        console.log("Conexao estabelecida com sucesso");
    } catch (error) {
        console.error("Foi impossivel estabelecer a conexao", error);
    } finally {
        await prisma.$disconnect();
    }
}


testarConexao();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
