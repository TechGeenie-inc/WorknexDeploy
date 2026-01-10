import { DecimalPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Banknote, Briefcase, DollarSign, FolderClock, } from 'lucide-angular';
import { SegmentedControl } from "../../components/segmented-control/segmented-control";
import { SmallCardSection } from '../../components/small-card-section/small-card-section';
import { SmallCard } from '../../components/small-card/small-card';
import { AddFechamento } from "../../components/tabelas/add-fechamento/add-fechamento";
import { Fechamento } from '../../components/tabelas/add-fechamento/fechamento';
import { HistoricoFechamento } from "../../components/tabelas/historico-fechamento/historico-fechamento";
import { FechamentoService } from '../../services/fechamento-service';
import { PermissionService } from '../../services/permission-service';

@Component({
  selector: 'app-pg-fechamento',
  imports: [SmallCard, SmallCardSection, AddFechamento, HistoricoFechamento, SegmentedControl, DecimalPipe],
  templateUrl: './pg-fechamento.html',
  styleUrl: './pg-fechamento.scss'
})
export class PgFechamento {
  service = inject(FechamentoService);
  perm = inject(PermissionService);
  
  fechamentoIsOpen: boolean = true;
  quantidadeFechamentos: number = 0;
  receitaTotal: number = 0;
  valorMedio: number = 0;
  horasTotais: number = 0;

  constructor() {
    this.service.fechamento$.subscribe((lista: Fechamento[]) => {
      const listaFiltrada = lista.filter(f => f.isActive !== false)
      this.quantidadeFechamentos = listaFiltrada.length;
      let receita = 0;
      let horas = 0;
      for (const f of listaFiltrada) {
        receita += (f.valorTotal || 0);
        horas += (f.horasTotais || 0);
      }
      this.receitaTotal = receita;
      this.valorMedio = receita / this.quantidadeFechamentos;
      this.horasTotais = horas;
    })
  }

  readonly Briefcase = Briefcase;
  readonly DollarSign = DollarSign;
  readonly Banknote = Banknote;
  readonly FolderClock = FolderClock;

  onSelectionChange(index: number) {
    this.fechamentoIsOpen = index === 0;
  }
}
