import { v4 as uuid } from 'uuid';
import { Equipe } from '../../popUps/add-equipe/equipe';
import { Membro } from '../../popUps/add-member/membro';

export interface DetalheMembroFechamento {
    membroId: string;
    membroNome: string;
    membroFuncao: string;
    horasTrabalhadas: number;
    horasExtras: number;
    adicional: number;
    diarias: number;
    precoVenda: number;
    valorTotal: number;
}

export class Fechamento {
    id?: string;
    idEquipe: string = '';
    equipeNome?: string;
    equipeTarefa?: string;
    equipeDataInicio?: Date;
    equipeDataFinal?: Date;
    equipeCliente?: string;
    horasTotais?: number;
    qtdMembros?: number;
    obs?: string;
    valorTotal?: number;
    status: boolean = false;
    isActive: boolean = true;
    export: boolean = false;


    equipe?: Equipe;
    membrosFechados: FechamentoMembro[] = [];
    detalhesMembros: DetalheMembroFechamento[] = [];

    static newFechamento() {
        const fechamento = new Fechamento();
        fechamento.id = uuid();
        return fechamento;
    }
}

export interface FechamentoMembro {
    fechamentoId: string;
    membroId: string;
    horasTrabalhadas: number;
    horasExtras: number;
    adicional: number;
    diarias: number;
    valorTotal: number;

    membro?: Membro;
}
