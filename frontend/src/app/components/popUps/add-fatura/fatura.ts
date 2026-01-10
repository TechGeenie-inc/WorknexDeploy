import { v4 as uuid } from 'uuid';
import { Fechamento } from '../../tabelas/add-fechamento/fechamento';

export class Fatura {
    id?: string;
    friendlyId?: number;
    fechamentoId: string = '';
    clienteNome?: string;
    valorTotal?: number;
    vencimento?: Date;
    formaPagamento?: FormaPagamento;
    status: 'pago' | 'pendente' | 'vencido' = 'pendente';
    isActive: boolean = true;

    fechamento?: Fechamento;

    static newFatura() {
        const fatura = new Fatura();
        fatura.id = uuid();
        return fatura;
    }
}

export enum FormaPagamento {
    Pix = 'pix',
    TransferenciaBancaria = 'transferenciaBancaria',
    BoletoBancario = 'boletoBancario',
    CartaoDeCredito = 'cartaoDeCredito',
}