import { DecimalPipe } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-resumo-taxa-pagamentos',
  imports: [DecimalPipe],
  templateUrl: './resumo-taxa-pagamentos.html',
  styleUrl: './resumo-taxa-pagamentos.scss'
})
export class ResumoTaxaPagamentos {
  @Input() paid: number = 0;
  @Input() pending: number = 0;
  @Input() overdue: number = 0;
  paidPercent: number = 100;
  pendingPercent: number = 0;
  overduePercent: number = 0;

  ngOnChanges(): void {
    this.calcularPorcentagens();
  }

  private calcularPorcentagens(): void {
    const total = this.paid + this.pending + this.overdue;

    if (total === 0) {
      this.paidPercent = this.pendingPercent = this.overduePercent = 0;
      return;
    } else {
      this.paidPercent = (this.paid / total) * 100;
      this.pendingPercent = (this.pending / total) * 100;
      this.overduePercent = (this.overdue / total) * 100;
    }


  }

}
