import { Dialog } from '@angular/cdk/dialog';
import { Component, inject, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { CircleAlert, CircleCheckBig, FolderClock, Plus, Users } from 'lucide-angular';
import { MainButton } from '../../components/main-button/main-button';
import { AddEquipe } from '../../components/popUps/add-equipe/add-equipe';
import { Equipe, Status } from '../../components/popUps/add-equipe/equipe';
import { SmallCardSection } from '../../components/small-card-section/small-card-section';
import { SmallCard } from '../../components/small-card/small-card';
import { ConsultaEquipe } from '../../components/tabelas/consulta-equipe/consulta-equipe';
import { EquipeService } from '../../services/equipe-service';
import { PermissionService } from '../../services/permission-service';

@Component({
  selector: 'app-pg-equipes',
  imports: [
    SmallCard,
    SmallCardSection,
    ConsultaEquipe,
    MatButtonModule,
    MainButton,
  ],
  templateUrl: './pg-equipes.html',
  styleUrls: ['./pg-equipes.scss',],
})
export class PgEquipes {
  private dialog = inject(Dialog);
  private service = inject(EquipeService);
  perm = inject(PermissionService);
  readonly Plus = Plus;
  readonly Users = Users;
  readonly FolderClock = FolderClock;
  readonly CircleCheckBig = CircleCheckBig;
  readonly CircleAlert = CircleAlert;

  quantidadeEquipes: number = 0;
  quantidadeEmAndamento: number = 0;
  quantidadeConcluido: number = 0;
  quantidadePausado: number = 0;
  cardSelecionado: 'total' | 'ativas' | 'concluidas' | 'pausadas' | null = null;

  @ViewChild(ConsultaEquipe) tabela?: ConsultaEquipe;

  constructor() {
    this.service.equipe$.subscribe((lista: Equipe[]) => {
      const listaFiltrada = lista.filter(e => e.isActive !== false);
      this.quantidadeEquipes = listaFiltrada.length;
      this.quantidadeEmAndamento = listaFiltrada.filter((e => e.status === Status.EmAndamento)).length;
      this.quantidadePausado = listaFiltrada.filter((e => e.status === Status.Impedido || e.status === Status.EmEspera)).length;
      this.quantidadeConcluido = listaFiltrada.filter((e => e.status === Status.Concluido)).length;
    })
  }

  protected openModal() {
    this.service.equipeEmEdicao = undefined;
    const ref = this.dialog.open(AddEquipe, { disableClose: true });

    ref.closed.subscribe((novaEquipe) => {
      const equipe = novaEquipe as Equipe | undefined;
      if (novaEquipe) {
        this.tabela?.recarregarLista();
      }
    })
  }

  filtrarAtivas() {
    if (!this.tabela) return;
    this.tabela.filtroStatus = Status.EmAndamento;
    this.tabela.filtrarEquipes();
    this.cardSelecionado = 'ativas';
  }

  filtragemPausadas() {
    if (!this.tabela) return;
    this.tabela.filtroStatus = 'pausadas';
    this.tabela.filtrarEquipes();
    this.cardSelecionado = 'pausadas';
  }

  filtrarTotal() {
    if (!this.tabela) return;
    this.tabela?.recarregarLista();
    this.cardSelecionado = 'total';
  }

  filtrarConcluidas() {
    if (!this.tabela) return;
    this.tabela.filtroStatus = Status.Concluido;
    this.tabela.filtrarEquipes();
    this.cardSelecionado = 'concluidas';
  }
}
