import { Dialog } from '@angular/cdk/dialog';
import { CommonModule } from '@angular/common';
import { Component, inject, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { BanknoteArrowDown, DollarSign, Plus, TrendingUp, TriangleAlert } from 'lucide-angular';
import { MainButton } from '../../components/main-button/main-button';
import { AddFatura } from '../../components/popUps/add-fatura/add-fatura';
import { Fatura } from '../../components/popUps/add-fatura/fatura';
import { ResumoTaxaPagamentos } from '../../components/resumo-taxa-pagamentos/resumo-taxa-pagamentos';
import { SegmentedControl } from '../../components/segmented-control/segmented-control';
import { SmallCardSection } from '../../components/small-card-section/small-card-section';
import { SmallCard } from '../../components/small-card/small-card';
import { ConsultaFatura } from '../../components/tabelas/consulta-fatura/consulta-fatura';
import { FaturaService } from '../../services/fatura-service';
import { PermissionService } from '../../services/permission-service';

@Component({
  selector: 'app-pg-faturamento',
  imports: [
    SmallCard,
    SmallCardSection,
    MatButtonModule,
    ConsultaFatura,
    SegmentedControl,
    MainButton,
    ResumoTaxaPagamentos,
    CommonModule
  ],
  templateUrl: './pg-faturamento.html',
  styleUrls: ['./pg-faturamento.scss']
})
export class PgFaturamento {
  private dialog = inject(Dialog);
  private service = inject(FaturaService);
  perm = inject(PermissionService);
  paginaFatura: boolean = false;

  readonly Plus = Plus;
  readonly DollarSign = DollarSign;
  readonly BanknoteArrowDown = BanknoteArrowDown;
  readonly TriangleAlert = TriangleAlert;
  readonly TrendingUp = TrendingUp;

  currentDate = new Date();
  currentYear: string = this.currentDate.getFullYear().toString();
  month: string = this.currentDate.toLocaleString('pt-BR', { month: 'long' });
  currentMonth: string = this.month.charAt(0).toUpperCase() + this.month.slice(1);
  faturasVencidas: number = 0;
  receitaTotal: number = 0;
  valorAtraso: number = 0;
  receitaMensal: number = 0;
  receitaPendente: number = 0;
  paidInvoices: number = 0;
  pendingInvoices: number = 0;
  overdueInvoices: number = 0;

  @ViewChild(ConsultaFatura) private tabela?: ConsultaFatura;

  constructor() {
    this.service.fatura$.subscribe(lista => {
      const listaFiltrada = lista.filter(f => f.isActive !== false);
      let paidValue = 0;
      let paidCounter = 0;
      for (const f of listaFiltrada.filter(f => f.status === 'pago')) {
        paidValue += (f.valorTotal || 0);
        paidCounter += 1;
      }
      this.receitaTotal = paidValue;
      this.paidInvoices = paidCounter;
      let pendingValue = 0;
      let pendingCounter = 0;
      for (const f of listaFiltrada.filter(f => f.status === 'pendente')) {
        pendingValue += (f.valorTotal || 0);
        pendingCounter += 1;
      }
      this.receitaPendente = pendingValue;
      this.pendingInvoices = pendingCounter;
      let overdueValue = 0;
      let overdueCounter = 0;
      for (const f of listaFiltrada.filter(f => f.status === 'vencido')) {
        overdueValue += (f.valorTotal || 0);
        overdueCounter += 1;
      }
      this.valorAtraso = overdueValue;
      this.overdueInvoices = overdueCounter;
      let mensal = 0;
      const thisMontPaidList = listaFiltrada.filter(f => f.status === 'pago' && f.vencimento)
      for (const f of thisMontPaidList.filter(f => f.status === 'pago' &&
        new Date(f.vencimento || 0).getMonth() === this.currentDate.getMonth() &&
        new Date(f.vencimento || 0).getFullYear().toString() === this.currentYear)) {
        mensal += f.valorTotal || 0;
      }
      this.receitaMensal = mensal;
    })
  }

  onSelectionChange(index: number) {
    this.paginaFatura = index === 0; /*Compara o retorno com o 0, já que a variavel é booleana */
  }

  protected openModal() {
    this.service.faturaEmEdicao = undefined;
    const ref = this.dialog.open(AddFatura, { disableClose: true });

    ref.closed.subscribe((novaFatura) => {
      const equipe = novaFatura as Fatura | undefined;
      if (novaFatura) {
        this.tabela?.recarregarLista();
      }
    })
  }
}
