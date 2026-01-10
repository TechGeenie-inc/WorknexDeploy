import { v4 as uuid } from 'uuid';

export class Cliente {
    id?: string;
    tipoCliente?: 'CPF' | 'CNPJ';


    razaoSocial?: string;
    cnpj?: string;
    inscricaoEstadual?: string;


    nomeCompleto?: string;
    cpf?: string;


    nomeFantasia?: string;
    contato?: string;
    email?: string;
    enderecoCompleto?: string;
    cidade?: string;
    estado?: string;
    cep?: string;
    projetosTotal: number = 0;
    projetosAtivos: number = 0;
    observacoes?: string;
    cadastro?: Date;
    isActive: boolean = true;

    static newCliente() {
        const cliente = new Cliente();
        cliente.id = uuid();
        cliente.cadastro = new Date();
        return cliente;
    }
}
