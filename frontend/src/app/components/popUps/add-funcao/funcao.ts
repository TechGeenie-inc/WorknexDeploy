import { v4 as uuid } from 'uuid'

export class Funcao {
    id?: string;
    nomeFuncao?: string;
    isActive: boolean = true;

    static newFuncao() {
        const funcao = new Funcao;
        funcao.id = uuid();
        return funcao;
    }
}