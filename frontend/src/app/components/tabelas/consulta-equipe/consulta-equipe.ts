import { Dialog } from '@angular/cdk/dialog';
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Download, LucideAngularModule, SquarePen, Trash2, Users } from 'lucide-angular';
import { ClienteService } from '../../../services/cliente-service';
import { EquipeService } from '../../../services/equipe-service';
import { PermissionService } from '../../../services/permission-service';
import { ToastService } from '../../../services/toast-service';
import { AddEquipe } from '../../popUps/add-equipe/add-equipe';
import { Equipe, Status } from '../../popUps/add-equipe/equipe';
import { ConfirmaDeletar } from '../../popUps/confirma-deletar/confirma-deletar';
import { ListagemMembroEquipe } from '../../popUps/listagem-membro-equipe/listagem-membro-equipe';

@Component({
  selector: 'app-consulta-equipe',
  imports: [
    CommonModule,
    MatIconModule,
    MatInputModule,
    MatTableModule,
    MatCardModule,
    MatButtonModule,
    MatTooltipModule,
    FormsModule,
    LucideAngularModule
  ],
  templateUrl: './consulta-equipe.html',
  styleUrls: ['./consulta-equipe.scss']
})
export class ConsultaEquipe implements OnInit {
  readonly Users = Users;
  readonly Trash2 = Trash2;
  readonly SquarePen = SquarePen;
  readonly Download = Download;
  private readonly clienteLimite = 25;

  private dialog = inject(Dialog);
  private serviceCliente = inject(ClienteService);
  service = inject(EquipeService);
  private toast = inject(ToastService);
  perm = inject(PermissionService);

  Status = Status;
  filtroStatus?: Status | 'pausadas';
  termoBusca: string = '';
  columnsTable: string[] = ["equipe", "cliente", "tarefa", "membros", "periodo", "status", "acoes"];

  listaEquipes: Equipe[] = [];
  listaEquipesCompleta: Equipe[] = [];

  currentPage = 1;
  pageSize = 10;
  totalPages = 1;


  ngOnInit() {
    this.service.equipe$.subscribe(lista => {
      this.listaEquipesCompleta = lista.filter(e => e.isActive !== false);
      this.totalPages = Math.ceil(this.listaEquipesCompleta.length / this.pageSize);
      this.currentPage = 1;
      this.atualizarLista();
    });
  }

  get equipesPaginadas(): Equipe[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.listaEquipesCompleta.slice(start, start + this.pageSize);
  }

  atualizarLista() {
    this.listaEquipes = this.equipesPaginadas;
  }

  recarregarLista() {
    this.service.obterBackend().subscribe({
      next: (equipes) => {
        this.listaEquipesCompleta = equipes.filter(e => e.isActive !== false);
        this.atualizarLista();
      },
      error: err => {
        if (err.status !== 403) {
          this.toast.show(`Erro ao carregar lista de equipes: ${err.error?.erro}`);
        }
      }
    })
  }

  limparBusca() {
    this.termoBusca = ""
    this.filtrarEquipes()
  }

  preparaDeletar(equipe: Equipe) {
    if (!this.perm.can('equipes', 'delete')) {
      this.toast.show("Sem permissão para deletar equipes");
      return;
    }
    this.service.equipeEmDelete = equipe;
    const ref = this.dialog.open(ConfirmaDeletar, {});
    ref.closed.subscribe(() => {
      this.recarregarLista();
      this.service.carregarEquipes();
    });
  }

  preparaEditar(id: string) {
    if (!this.perm.can('equipes', 'edit')) {
      this.toast.show("Sem permissão para editar equipes");
      return;
    }
    this.service.buscarEquipePorIdBackend(id).subscribe({
      next: (equipe) => {
        this.service.equipeEmEdicao = equipe;
        const ref = this.dialog.open(AddEquipe, {});
        ref.closed.subscribe(() => { this.recarregarLista(); });
      },
      error: err => {
        this.toast.show(`Erro ao editar a equipe: ${err.error?.erro}`);
      }
    });
  }

  abrirMembrosEquipe(equipeId: string) {
    this.service.buscarEquipePorIdBackend(equipeId).subscribe({
      next: (equipe) => {
        this.service.equipeSelecionada = equipe;
        const ref = this.dialog.open(ListagemMembroEquipe, {
          disableClose: true,
          data: equipe,
        });
      },
      error: err => {
        this.toast.show(`Erro ao econtrar a equipe: ${err.error?.erro}`);
      }
    });
  }

  filtrarEquipes() {
    this.service.pesquisarEquipe(this.termoBusca, {
      status: this.filtroStatus
    }).subscribe(equipes => {
      this.listaEquipesCompleta = equipes;
    });
  }

  limitarMembros(membros: any[], limite: number = 2): any[] {
    if (!membros || membros.length === 0) return [];
    return membros.slice(0, limite);
  }

  transformarEmNome(nome?: string): string {
    if (!nome) return '--';
    return nome.split(' ').map(s => s[0]).slice(0, 2).join('').toUpperCase();
  }

  alterarStatus(equipe: Equipe) {
    this.service.setStatus(equipe.id!, equipe.status as Status);
    this.service.carregarEquipes();
    this.serviceCliente.carregarClientes();
  }


  truncateCliente(texto?: string): string {
    if (!texto) return '';
    if (texto.length <= this.clienteLimite) return texto;
    return `${texto.slice(0, this.clienteLimite).trimEnd()}...`;
  }

  exportar() {
    this.service.exportarZIP().subscribe((arquivo) => {
      const blob = new Blob([arquivo], {
        type: "application/zip"
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "equipes.zip";
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }
}
