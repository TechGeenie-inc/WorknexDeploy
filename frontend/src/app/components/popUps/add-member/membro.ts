import { v4 as uuid } from 'uuid'

export class Membro {
    id?: string;
    nome?: string;
    cpf?: string;
    contato?: string;
    funcaoId?: string;
    funcao?: {
        nomeFuncao: string;
    };
    precoHora: number = 0;
    precoVenda: number = 0;
    tipoPagamento?: TipoPagamento;
    chavePix?: string;
    bancoAgencia?: string;
    bancoConta?: string;
    bancoNome?: string;
    bancoTipo?: TipoConta;

    dataInicioIndividual?: string;
    dataFimIndividual?: string;

    participacao?: {
        id: string;
        dataInicio: string;
        dataFim: string;
        equipeId: string;
        membroId: string;
    }[] = [];

    status: 'ativo' | 'inativo' | 'ocupado' = 'inativo';
    isActive: boolean = true;

    static newMembro() {
        const membro = new Membro();
        membro.id = uuid();
        return membro;
    }
}

export enum TipoPagamento {
    Pix = 'pix',
    Banco = 'banco'
}

export enum TipoConta {
    Corrente = 'corrente',
    Poupanca = 'poupanca'
}

