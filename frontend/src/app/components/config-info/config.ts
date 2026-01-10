export class Config {
    nomeDaEmpresa?: string;
    email?: string;
    website?: string;
    contato?: string;
    endereco?: string;
    cnpj?: string
    razaoSocial?: string
    nomeFantasia?: string
    inscricaoEstadual?: string

    static newConfig(): Config {
        return new Config();
    }
}