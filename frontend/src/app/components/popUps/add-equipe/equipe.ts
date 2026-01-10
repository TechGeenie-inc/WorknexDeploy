import { v4 as uuid } from 'uuid';
import { Membro } from '../add-member/membro';
import { Cliente } from '../add-cliente/cliente';

export class Equipe {
    id?: string;
    nomeEquipe?: string;
    clienteSelecionado?: string;
    dataInicio?: Date;
    dataFinal?: Date;
    tarefa?: string;
    status?: Status;
    isActive: boolean = true;

    membrosIds?: string[];
    membros?: Membro[];
    clienteId: string = '';
    cliente?: Cliente;

    participacaoMembros?: {
        membroId: string;
        dataInicio: string;
        dataFim: string;
    }[];

    static newEquipe() {
        const equipe = new Equipe();
        equipe.id = uuid();
        equipe.status = Status.EmEspera;
        return equipe;
    }
}

export enum Status {
    Concluido = "Concluido",
    EmEspera = "EmEspera",
    Impedido = "Impedido",
    EmAndamento = "EmAndamento"
}