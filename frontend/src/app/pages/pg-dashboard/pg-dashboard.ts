import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Building2, ChartNoAxesCombined, CircleCheckBig, DollarSign, Receipt, TriangleAlert, User, Users } from 'lucide-angular';
import { BigCardSection } from "../../components/big-card-section/big-card-section";
import { BigCard, ListItem } from "../../components/big-card/big-card";
import { Status } from '../../components/popUps/add-equipe/equipe';
import { SmallCardSection } from "../../components/small-card-section/small-card-section";
import { SmallCard } from '../../components/small-card/small-card';
import { ClienteService } from '../../services/cliente-service';
import { EquipeService } from '../../services/equipe-service';
import { FaturaService } from '../../services/fatura-service';
import { MembroService } from '../../services/membro-service';
import { SaldoService } from '../../services/saldo-service';
import { ToastService } from '../../services/toast-service';
import { TransacaoService } from '../../services/transacao-service';

@Component({
  selector: 'app-pg-dashboard',
  imports: [
    SmallCard,
    BigCard,
    BigCardSection,
    SmallCardSection,
    CommonModule
  ],
  templateUrl: './pg-dashboard.html',
  styleUrl: './pg-dashboard.scss'
})
export class PgDashboard implements OnInit {
  readonly User = User;
  readonly Users = Users;
  readonly Building2 = Building2;
  readonly ChartNoAxesCombined = ChartNoAxesCombined;
  readonly DollarSign = DollarSign;
  readonly Receipt = Receipt;
  readonly TriangleAlert = TriangleAlert;
  readonly CircleCheckBig = CircleCheckBig;

  nomeUsuario: string = 'Nome não informado';
  equipesAtivas: ListItem[] = [];
  ultimasTransacoes: ListItem[] = [];

  private serviceEquipe = inject(EquipeService);
  private serviceTransacao = inject(TransacaoService);
  private serviceMembro = inject(MembroService);
  private serviceCliente = inject(ClienteService);
  private saldoService = inject(SaldoService);
  private serviceFatura = inject(FaturaService);
  private toast = inject(ToastService);

  membrosAtivos: number = 0;
  equipesCadastradas: number = 0;
  clientesCadastrados: number = 0;
  saldoAtual: number = 0;
  receitaTotal: number = 0;
  despesaTotal: number = 0;
  faturasPendentes: number = 0;
  projetosConcluidos: number = 0;


  ngOnInit() {

    this.serviceMembro.membros$.subscribe((lista) => {
      const listaFiltrada = lista.filter(m => m.isActive !== false);
      const membros = listaFiltrada;
      this.membrosAtivos = membros.filter(m => m.status === 'ativo').length;
    });

    this.serviceCliente.cliente$.subscribe((lista) => {
      const listaFiltrada = lista.filter(m => m.isActive !== false);
      this.clientesCadastrados = listaFiltrada.length;
    });

    this.saldoService.saldo$.subscribe((valor) => {
      this.saldoAtual = valor;
    })

    this.serviceFatura.fatura$.subscribe((lista) => {
      const listaFiltrada = lista.filter(f => f.isActive !== false && f.status === 'pendente')
      this.faturasPendentes = listaFiltrada.length;
    })

    this.serviceEquipe.equipe$.subscribe((equipes) => {
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      const equipesValidas = equipes.filter(e => e.isActive !== false)
      const listaFiltrada = equipes.filter(e => e.isActive !== false &&
        e.status === Status.EmAndamento);

      const listaOrdenada = listaFiltrada.sort((a, b) => {
        const dataA = a.dataInicio ? new Date(`${a.dataInicio}`).getTime() : 0;
        const dataB = b.dataInicio ? new Date(`${b.dataInicio}`).getTime() : 0;
        return dataB - dataA;
      });

      this.equipesCadastradas = equipesValidas.filter(m => m.status === Status.EmAndamento).length
      const listaConcluidos = equipesValidas.filter(m => m.status === Status.Concluido)
      this.projetosConcluidos = listaConcluidos.length;

      this.equipesAtivas = listaOrdenada.filter(e => e.status === Status.EmAndamento)
        .map(e => ({
          title: e.nomeEquipe ?? "Sem nome",
          title2: `${e.membros?.length ?? 0} membro(s)`,
          subtitle: e.tarefa ?? "Sem projeto",
          subtitle2: this.formatarPeriodo(e)
        }));
    });

    this.serviceTransacao.transacao$.subscribe((transacoes) => {
      this.atualizarSaldos();
      const hoje = new Date();
      hoje.setHours(23, 59, 59, 999);
      const seteDiasAtras = new Date();
      seteDiasAtras.setDate(hoje.getDate() - 7);
      seteDiasAtras.setHours(0, 0, 0, 0);
      const transacoesRecentes = transacoes.filter(t => {
        if (!t.data) return false;
        const dataTransacao = new Date(t.data);
        return dataTransacao >= seteDiasAtras && dataTransacao <= hoje;
      });
      // Ordenar da mais recente para a mais antiga
      const transacoesOrdenadas = transacoesRecentes.sort((a, b) => {
        const dataA = new Date(`${a.data}`).getTime();
        const dataB = new Date(`${b.data}`).getTime();
        return dataB - dataA;
      });
      this.ultimasTransacoes = transacoesOrdenadas.map(t => {
        let tipoAmigavel = "";
        switch (t.tipo) {
          case 'receita': tipoAmigavel = "Receita"; break;
          case 'despesa': tipoAmigavel = "Despesa"; break;
          case 'despesaOperacional': tipoAmigavel = "Despesa Operacional"; break;
          default: tipoAmigavel = t.tipo ?? "Sem Tipo";
        }
        return {
          title: t.desc ?? "Sem descrição",
          title2: t.valor
            ? `${tipoAmigavel === 'Receita' ? '+' : '-'}R$ ${t.valor.toFixed(2)}`
            : "R$ 0,00",
          subtitle: t.data
            ? this.formatarData(new Date(`${t.data}`))
            : "Sem data",
          subtitle2: tipoAmigavel
        };
      });
    });
  }

  private atualizarSaldos() {
    const resumo = this.serviceTransacao.getResumo().subscribe({
      next: (resumo) => {
        this.receitaTotal = resumo.receitaTotal;
        this.despesaTotal = resumo.despesaTotal;
      },
      error: err => {
        if (err.status === 403) {
          return;
        }
        this.toast.show(`Erro ao obter informações de saldo: ${err.error?.erro}`);
      }
    });
  }

  formatarData(data: Date | null | undefined): string {
    if (!data) return "Sem data";
    const dia = data.getDate().toString().padStart(2, '0');
    const mes = (data.getMonth() + 1).toString().padStart(2, '0');
    const ano = data.getFullYear();
    return `${dia}/${mes}/${ano}`;
  }

  private formatarPeriodo(e: any): string {
    const inicio = e.dataInicio ? this.formatarData(new Date(`${e.dataInicio}`)) : null;
    const fim = e.dataFinal ? this.formatarData(new Date(`${e.dataFinal}`)) : null;

    if (inicio && fim) return `${inicio} - ${fim}`;
    if (inicio) return inicio;
    return "Sem data";
  }
}