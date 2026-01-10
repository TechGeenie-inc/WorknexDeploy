import { Routes } from '@angular/router';
import { Pg404 } from './pages/pg-404/pg-404';
import { PgAgenda } from './pages/pg-agenda/pg-agenda';
import { PgClientes } from './pages/pg-clientes/pg-clientes';
import { PgConfiguracoes } from './pages/pg-configuracoes/pg-configuracoes';
import { PgDashboard } from './pages/pg-dashboard/pg-dashboard';
import { PgEquipes } from './pages/pg-equipes/pg-equipes';
import { PgFaturamento } from './pages/pg-faturamento/pg-faturamento';
import { PgFechamento } from './pages/pg-fechamento/pg-fechamento';
import { PgFluxoDeCaixa } from './pages/pg-fluxo-de-caixa/pg-fluxo-de-caixa';
import { PgFuncoes } from './pages/pg-funcoes/pg-funcoes';
import { PgLogin } from './pages/pg-login/pg-login';
import { PgMembros } from './pages/pg-membros/pg-membros';
import { authGuard } from './guards/auth-guard';
import { noauthGuard } from './guards/noauth-guard';

export const routes: Routes = [
    { path: 'login', component: PgLogin, canActivate: [noauthGuard] },
    { path: '', component: PgDashboard, canActivate: [authGuard] },
    { path: 'agenda', component: PgAgenda, canActivate: [authGuard] },
    { path: 'membros', component: PgMembros, canActivate: [authGuard] },
    { path: 'equipes', component: PgEquipes, canActivate: [authGuard] },
    { path: 'funcoes', component: PgFuncoes, canActivate: [authGuard] },
    { path: 'clientes', component: PgClientes, canActivate: [authGuard] },
    { path: 'fechamento', component: PgFechamento, canActivate: [authGuard] },
    { path: 'faturamento', component: PgFaturamento, canActivate: [authGuard] },
    { path: 'fluxoDeCaixa', component: PgFluxoDeCaixa, canActivate: [authGuard] },
    { path: 'configuracoes', component: PgConfiguracoes, canActivate: [authGuard] },
    { path: '404', component: Pg404, canActivate: [authGuard] },
    { path: '**', redirectTo: '/404' },
];
