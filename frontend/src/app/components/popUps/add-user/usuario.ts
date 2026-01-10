import { ModulePermissions } from "../select-card/select-card";

export class Usuario {
    id?: string;
    nome?: string;
    email?: string; 
    senha?: string;
    roleId?: string;
    role?: Role = Role.personalizado;
    permissions?: Record<string, ModulePermissions>;
    autenticacaoAtiva: boolean = false;

    isActive: boolean = true;

    static newUsuario(): Usuario {
        return new Usuario();
    }
}

export enum Role {
    admin = "admin",
    gerente = "gerente",
    visualizador = "visualizador",
    personalizado = "personalizado"
}