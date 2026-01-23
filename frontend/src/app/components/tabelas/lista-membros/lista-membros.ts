import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSliderModule } from '@angular/material/slider';
import { Boxes, Calendar, Clock, DollarSign, Funnel, LucideAngularModule, Star, Users } from 'lucide-angular';
import { MembroService } from '../../../services/membro-service';
import { Equipe } from '../../popUps/add-equipe/equipe';
import { Membro } from '../../popUps/add-member/membro';
import { MostraMembro } from '../mostra-membro/mostra-membro';
import { FuncaoService } from '../../../services/funcao-service';
import { Funcao } from '../../popUps/add-funcao/funcao';
import { EquipeService } from '../../../services/equipe-service';
import { ToastService } from '../../../services/toast-service';


@Component({
  selector: 'app-lista-membros',
  imports: [
    CommonModule,
    MostraMembro,
    MatSliderModule,
    MatIconModule,
    FormsModule,
    LucideAngularModule
  ],
  templateUrl: './lista-membros.html',
  styleUrls: ['./lista-membros.scss'],
})
export class ListaMembros implements OnInit, OnChanges {
  readonly Users = Users;
  readonly Boxes = Boxes;
  readonly Funnel = Funnel;
  readonly Clock = Clock;
  readonly DollarSign = DollarSign;
  readonly Star = Star;
  readonly Calendar = Calendar;

  private service = inject(MembroService);
  private serviceFuncao = inject(FuncaoService);
  private serviceEquipe = inject(EquipeService);
  private toast = inject(ToastService);

  @Input() equipe!: Equipe;
  @Input() dataAtualizadaTrigger = 0;
  membros: Membro[] = [];
  todosMembros: Membro[] = [];
  todasEquipes: Equipe[] = [];
  selecionados: { [id: string]: boolean } = {};
  membrosSelecionados: Membro[] = [];

  funcoes: Funcao[] = [];
  funcoesSelecionadas: string[] = [];

  pesquisaAberta: boolean = false;
  minValor: number = 0;
  maxValor: number = 500;
  minStar: number = 0.0;
  maxStar: number = 5.0;

  termoBusca = '';

  filtroStatus?: 'ativo' | 'inativo';

  ngOnInit() {
    this.serviceEquipe.equipe$.subscribe(lista => {
      this.todasEquipes = lista.filter(e => e.isActive !== false);
    });

    this.service.membros$.subscribe(lista => {
      this.todosMembros = lista.filter(m => m.isActive !== false);
      this.membros = [...this.todosMembros];
    });

    this.serviceFuncao.funcao$.subscribe(lista => {
      this.funcoes = lista.filter(f => f.isActive !== false);
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes['dataAtualizadaTrigger']) {
      this.filtrarMembros();
    }
  }

  onToggleSelecao(event: { id: string, selected: boolean }) {
    if (!this.equipe.membrosIds) this.equipe.membrosIds = [];
    if (!this.equipe.membros) this.equipe.membros = [];

    const membro = this.membros.find(m => m.id === event.id);
    if (!membro) return;

    if (event.selected) {
      this.equipe.membrosIds.push(event.id);
      this.equipe.membros.push({ ...membro });
    } else {
      this.equipe.membrosIds = this.equipe.membrosIds.filter(id => id !== event.id);
      this.equipe.membros = this.equipe.membros.filter(m => m.id !== event.id);
    }
  }


  filtrarMembros() {
    this.membros = this.todosMembros.filter(m => {
      const ocupado = this.isMembroOcupado(m);

      const dentroDoPreco =
        (!this.minValor || m.precoVenda >= this.minValor) &&
        (!this.maxValor || m.precoVenda <= this.maxValor);

      const dentroDaFuncao =
        !this.funcoesSelecionadas.length ||
        this.funcoesSelecionadas.includes(m.funcaoId ?? '');

      const dentroDoStatus = (() => {
        if (!this.filtroStatus) return true;

        if (this.filtroStatus === 'ativo') {
          return m.status === 'ativo' && !ocupado;
        }

        if (this.filtroStatus === 'inativo') {
          return m.status === 'inativo' || ocupado;
        }

        return true;
      })();

      return dentroDoPreco && dentroDaFuncao && dentroDoStatus;
    });
  }


  toggleFuncao(funcaoId: string) {
    const index = this.funcoesSelecionadas.indexOf(funcaoId);

    if (index > -1) {
      this.funcoesSelecionadas.splice(index, 1);
    } else {
      this.funcoesSelecionadas.push(funcaoId);
    }
    this.filtrarMembros();
  }


  togglePesquisa() {
    this.pesquisaAberta = !this.pesquisaAberta;
  }

  buscaLive(valor: string) {
    this.serviceFuncao.pesquisarFuncao(valor).subscribe({
      next: (lista) => {
        this.funcoes = lista.filter(f => f.isActive !== false);
      },
      error: (err) => {
        this.toast.show(`Erro ao buscar por função: ${err.error?.erro}`);
      }
    });
  }

  resetFiltros() {
    this.funcoesSelecionadas = [];
    this.filtroStatus = undefined;
    this.minValor = 0;
    this.maxValor = 500;
    this.filtrarMembros();
  }

  private parseValidDate(value?: string | Date | null): Date | null {
    if (value === undefined || value === null) return null;
    const d = new Date(value as any);
    return isNaN(d.getTime()) ? null : d;
  }

  isMembroOcupado(membro: Membro): boolean {

    const dataInicio = this.parseValidDate(this.equipe.dataInicio);
    const dataFinal = this.parseValidDate(this.equipe.dataFinal);

    const participacao = this.todasEquipes
      .flatMap(eq => {
        return (eq.participacaoMembros || []).map(p => ({
          equipeId: eq.id,
          equipe: eq.nomeEquipe,
          ...p
        }));
      })
      .find(p => p.membroId === membro.id);

    if (this.equipe.id === participacao?.equipeId) {
      return false;
    }

    if (!participacao) {
      return false;
    }

    const participacaoInicio = this.parseValidDate(participacao.dataInicio);
    const participacaoFim = this.parseValidDate(participacao.dataFim);

    if (!participacaoInicio || !participacaoFim) {
      return false;
    }

    const conflito =
      participacaoInicio <= dataFinal! &&
      participacaoFim >= dataInicio!;

    return conflito;
  }


  onMembroDataChange(event: { membroId: string; dataInicio?: string; dataFim?: string }) {
    const membro = this.equipe.membros?.find(m => m.id === event.membroId);
    if (!membro) return;

    if (event.dataInicio) membro.dataInicioIndividual = event.dataInicio;
    if (event.dataFim) membro.dataFimIndividual = event.dataFim;
  }


}
