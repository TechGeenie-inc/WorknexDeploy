import { Dialog } from '@angular/cdk/dialog';
import { CommonModule } from '@angular/common';
import { Component, inject, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { CircleArrowDown, CircleArrowUp, Landmark, Plus, TrendingDown, TrendingUp } from 'lucide-angular';
import { MainButton } from '../../components/main-button/main-button';
import { AddTransacao } from '../../components/popUps/add-transacao/add-transacao';
import { Transacao } from '../../components/popUps/add-transacao/transacao';
import { SmallCardSection } from '../../components/small-card-section/small-card-section';
import { SmallCard } from '../../components/small-card/small-card';
import { ConsultaTransacao } from "../../components/tabelas/consulta-transacao/consulta-transacao";
import { PermissionService } from '../../services/permission-service';
import { ToastService } from '../../services/toast-service';
import { TransacaoService } from '../../services/transacao-service';

@Component({
  selector: 'app-pg-fluxo-de-caixa',
  imports: [
    SmallCard,
    SmallCardSection,
    MainButton,
    MatInputModule,
    MatButtonModule,
    ConsultaTransacao,
    CommonModule
  ],
  templateUrl: './pg-fluxo-de-caixa.html',
  styleUrls: ['./pg-fluxo-de-caixa.scss'],
})
export class PgFluxoDeCaixa {
  private dialog = inject(Dialog);
  private service = inject(TransacaoService);
  perm = inject(PermissionService);
  private toast = inject(ToastService);

  readonly Plus = Plus;
  readonly CircleArrowUp = CircleArrowUp;
  readonly CircleArrowDown = CircleArrowDown;
  readonly TrendingDown = TrendingDown;
  readonly Landmark = Landmark;
  readonly TrendingUp = TrendingUp;

  receitaTotal = 0;
  receitaMensal = 0;
  despesaTotal = 0;
  despesaMensal = 0;
  fluxoLiquido = 0;
  qtdTransacoes = 0;
  cardSelecionado: 'todas' | 'receita' | 'despesa' | null = null;

  @ViewChild(ConsultaTransacao) private tabela?: ConsultaTransacao;

  constructor() {
    this.atualizarSaldos();

    this.service.transacao$.subscribe(() => {
      this.atualizarSaldos();
    });
  }

  private atualizarSaldos() {
    this.service.getResumo().subscribe({
      next: (resumo) => {
        this.receitaTotal = resumo.receitaTotal;
        this.receitaMensal = resumo.receitaMensal;
        this.despesaTotal = resumo.despesaTotal;
        this.despesaMensal = resumo.despesaMensal;
        this.fluxoLiquido = resumo.fluxoLiquido;
        this.qtdTransacoes = resumo.qtdTransacoes;
      },
      error: err => {
        if (err.status === 403) {
          return;
        }
        this.toast.show(`Erro ao obter informações de saldo: ${err.error?.erro}`);
      }
    });
  }

  protected openModal() {
    this.service.transacaoEmEdicao = undefined;
    const ref = this.dialog.open(AddTransacao, { disableClose: true });

    ref.closed.subscribe((novaTransacao) => {
      const equipe = novaTransacao as Transacao | undefined;
      if (novaTransacao) {
      }
    })
  }

  filtrarTotal() {
    this.cardSelecionado = 'todas';
    this.service.filtrarPorTipo().subscribe({
      next: (transacoes) => {
        this.tabela!.listaTransacaoCompleta = transacoes;
      },
      error: err => {
        this.toast.show(`Erro ao filtrar transações: ${err.error?.erro}`);
      }
    })
  }

  filtrarReceita() {
    this.cardSelecionado = 'receita';
    this.service.filtrarPorTipo('receita').subscribe({
      next: (transacoes) => {
        this.tabela!.listaTransacaoCompleta = transacoes;
      },
      error: err => {
        this.toast.show(`Erro ao filtrar transações: ${err.error?.erro}`);
      }
    });
  }

  filtrarDespesas() {
    this.cardSelecionado = 'despesa';
    this.service.filtrarPorTipo('despesa').subscribe({
      next: (transacoes) => {
        this.tabela!.listaTransacaoCompleta = transacoes;
      },
      error: err => {
        this.toast.show(`Erro ao filtrar transações: ${err.error?.erro}`);
      }
    });;
  }

}
