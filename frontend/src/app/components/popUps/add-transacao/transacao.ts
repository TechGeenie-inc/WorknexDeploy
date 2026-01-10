import { v4 as uuid } from 'uuid';

export class Transacao {
    id?: string;
    tipo?: TipoTransacao | '' = '';
    categoria?: Categoria | '' = '';
    subcategoria?: SubCategoria | '' = '';
    desc?: string;
    valor: number = 0;
    data?: Date;
    recorrente: boolean = false;
    isActive: boolean = true;

    static newTransacao() {
        const transacao = new Transacao;
        transacao.id = uuid();
        return transacao;
    }
}

enum TipoTransacao {
    Receita = 'receita',
    Despesa = 'despesa',
    DespesaOperacional = 'despesaOperacional'
}

enum Categoria {
    PagamentoCliente = 'pagamentoCliente',
    PagamentoFreelancer = 'pagamentoFreelancer',
    Outros = 'outros'
}

enum SubCategoria {
    Escritorio = 'escritorio',
    Software = 'software',
    Marketing = 'marketing',
    Equipamentos = 'equipamentos',
    Outros = 'outros'
}