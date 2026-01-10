import { DecimalPipe, NgClass } from '@angular/common';
import { Component, Input, SimpleChanges } from '@angular/core';
import { Building2, Clock, Info, LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-gantt-item',
  imports: [LucideAngularModule, DecimalPipe, NgClass],
  templateUrl: './gantt-item.html',
  styleUrl: './gantt-item.scss'
})
export class GanttItem {
  @Input() title: string = ""; //Ex: Equipe de Limpeza Hotel Resort
  @Input() client: string = ""; //Hotel Resort LTDA
  @Input() startingDate: Date = new Date();
  @Input() endingDate: Date = new Date();
  @Input() status: "Ativo" | "Inativo" | "Concluido" = "Inativo";
  @Input() monthLength: number = 28; //Duração do Mes* FOR
  @Input() selectedMonth: number = 0;
  @Input() selectedYear: number = 0;
  startingDay: number = 0;
  chartStart: number = 0;
  startingMonth: number = 0;
  endingDay: number = 0;
  chartEnd: number = 0;
  endingMonth: number = 0;
  showItem: boolean = true;

  private readonly tituloLimite = 60;
  private readonly clienteLimite = 50;

  ngOnChanges(changes: SimpleChanges) {
    this.startingDay = this.startingDate.getDate();
    this.chartStart = this.startingDate.getDate();
    this.startingMonth = this.startingDate.getMonth() + 1;
    this.endingDay = this.endingDate.getDate();
    this.chartEnd = this.endingDate.getDate();
    this.endingMonth = this.endingDate.getMonth() + 1;
    /*Obtendo os valores vindo do Input */
    if (this.startingMonth !== this.selectedMonth) {
      this.startingDay = 1;
    }
    if (this.endingMonth !== this.selectedMonth) {
      this.endingDay = this.monthLength;
    }
    /*Garantido que o gráfico não quebre por um dia além do esperado.*/

    /*Verificando quais devem ser exibidos */
    if (this.selectedYear < this.startingYear || this.selectedYear > this.endingYear) {
      this.showItem = false;
      return;
    }
    if (this.selectedYear === this.startingYear && this.selectedMonth < this.startingMonth) {
      this.showItem = false;
      return;
    }
    if (this.selectedYear === this.endingYear && this.selectedMonth > this.endingMonth) {
      this.showItem = false;
      return;
    }
    this.showItem = true;
  }

  get startingYear(): number {
    return this.startingDate.getFullYear();
    ;
  }
  get endingYear(): number {
    return this.endingDate.getFullYear();
    ;
  }

  readonly Building2 = Building2;
  readonly Clock = Clock;
  readonly Info = Info;

  range(length: number): number[] {
    return Array.from({ length }, (_, i) => i + 1);
  }

  get days() {
    const days: {
      index: number;
      type: 'active' | 'inactive' | 'done' | 'empty';
      isStart: boolean;
      isEnd: boolean;
    }[] = [];

    for (let i = 1; i <= this.monthLength; i++) {
      const withinRange = i >= this.startingDay && i <= this.endingDay;
      const isStart = i === this.startingDay;
      const isEnd = i === this.endingDay;

      let type: 'active' | 'inactive' | 'done' | 'empty' = 'empty';
      if (withinRange) {
        if (this.status === 'Ativo') type = 'active';
        else if (this.status === 'Concluido') type = 'done';
        else type = 'inactive';
      }

      days.push({ index: i, type, isStart, isEnd });
    }

    return days;
  }

  trackByIndex(index: number, _: any) {
    return index;
  }

  get truncatedTitle(): string {
    return this.truncate(this.title, this.tituloLimite);
  }

  get truncatedClient(): string {
    return this.truncate(this.client, this.clienteLimite);
  }

  private truncate(texto?: string, limite?: number): string {
    if (!texto) return '';
    if (!limite || texto.length <= limite) return texto;
    return `${texto.slice(0, limite).trimEnd()}...`;
  }
}
