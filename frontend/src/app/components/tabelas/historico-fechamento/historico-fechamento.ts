import { Dialog } from '@angular/cdk/dialog';
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Download, Eye, LucideAngularModule, Trash2 } from 'lucide-angular';
import { EquipeService } from '../../../services/equipe-service';
import { FechamentoService } from '../../../services/fechamento-service';
import { MembroService } from '../../../services/membro-service';
import { PermissionService } from '../../../services/permission-service';
import { ToastService } from '../../../services/toast-service';
import { Equipe } from '../../popUps/add-equipe/equipe';
import { ConfirmaDeletar } from '../../popUps/confirma-deletar/confirma-deletar';
import { Fechamento } from '../add-fechamento/fechamento';
import { DetalhesMembros } from './detalhes-membros/detalhes-membros';

@Component({
  selector: 'app-historico-fechamento',
  imports: [
    MatInputModule,
    MatTooltipModule,
    MatButtonModule,
    MatTableModule,
    FormsModule,
    MatCardModule,
    MatIconModule,
    LucideAngularModule,
    CommonModule
  ],
  templateUrl: './historico-fechamento.html',
  styleUrl: './historico-fechamento.scss'
})
export class HistoricoFechamento implements OnInit {
  private service = inject(FechamentoService);
  private serviceEquipe = inject(EquipeService);
  private serviceMembro = inject(MembroService);
  private dialog = inject(Dialog);
  private toast = inject(ToastService);
  private readonly tarefaLimite = 40;
  perm = inject(PermissionService);

  readonly Trash2 = Trash2;
  readonly Eye = Eye;
  readonly Download = Download;

  termoBusca: string = '';
  columnsTable: string[] = ["export", "projeto", "cliente", "periodo", "membros", "valorTotal", "status", "acoes"];

  listaFechamentos: Fechamento[] = [];
  listaFechamentosCompleta: Fechamento[] = [];

  currentPage = 1;
  pageSize = 10;
  totalPages = 1;

  ngOnInit(): void {
    this.service.fechamento$.subscribe(lista => {
      const previousPage = this.currentPage || 1;
      this.listaFechamentosCompleta = lista.filter(f => f.isActive !== false);
      this.totalPages = Math.max(1, Math.ceil(this.listaFechamentosCompleta.length / this.pageSize));
      this.currentPage = Math.min(previousPage, this.totalPages);
      this.atualizarLista();
    })
  }

  resetExport() {
    this.service.resetExport().subscribe(() => {
      this.listaFechamentosCompleta.forEach(f => f.export = false);
    });
  }


  get fechamentosPaginados(): Fechamento[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.listaFechamentosCompleta.slice(start, start + this.pageSize);
  }

  atualizarLista() {
    this.listaFechamentos = this.fechamentosPaginados;
    this.resetExport();
  }

  recarregarLista() {
    this.service.obterBackend().subscribe({
      next: (fechamentos) => {
        this.listaFechamentosCompleta = fechamentos;
        this.atualizarLista();
        this.resetExport();
      },
      error: err => {
        if (err.status !== 403) {
          this.toast.show(`Erro ao carregar fechamentos: ${err.error?.erro}`);
        }
      }
    });
  }

  limparBusca() {
    this.termoBusca = ""
    this.recarregarLista()
  }

  truncateTarefa(texto?: string): string {
    if (!texto) return '';
    if (texto.length <= this.tarefaLimite) return texto;
    return `${texto.slice(0, this.tarefaLimite).trimEnd()}...`;
  }

  preparaDeletar(fechamento: Fechamento) {
    if (!this.perm.can('fechamento', 'delete')) {
      this.toast.show("Sem permissão para deletar fechamentos");
      return;
    }
    this.service.fechamentoEmDelete = fechamento;
    const ref = this.dialog.open(ConfirmaDeletar, {});
    ref.closed.subscribe(() => this.recarregarLista());
    this.resetExport();
  }

  preparaEditar(id: string) {
    if (!this.perm.can('fechamento', 'edit')) {
      this.toast.show("Sem permissão para editar fechamentos");
      return;
    }
    this.service.buscarFechamentoPorIdBackend(id).subscribe({
      next: (fechamento) => {
        this.service.fechamentoEmEdicao = fechamento;
        const ref = '';
        this.recarregarLista();
        this.termoBusca = '';
        this.resetExport();
      }
    });
  }

  buscaLive(valor: string) {
    this.service.pesquisarFechamento(valor).subscribe({
      next: (fechamentos) => {
        this.listaFechamentosCompleta = fechamentos;
        this.resetExport();
      },
      error: err => {
        this.toast.show(`Erro ao encontrar fechamentos: ${err.error?.erro}`);
      }
    })
  }

  getEquipe(fechamento: Fechamento): Equipe | undefined {
    return this.serviceEquipe.buscarEquipePorId(fechamento.idEquipe!);
  }

  getMembrosDaEquipe(fechamento: Fechamento) {
    const equipe = this.getEquipe(fechamento);
    if (!equipe?.membrosIds?.length) return [];

    return equipe.membrosIds
      .map(id => this.serviceMembro.buscarMembroPorId(id))
      .filter(m => !!m);
  }

  quantidadeMembros(fechamento: Fechamento): number {
    return this.getMembrosDaEquipe(fechamento).length;
  }

  alterarStatus(fechamento: Fechamento) {
    const concluido = !!fechamento.status;
    this.service.setStatus(fechamento.id!, concluido);
    this.service.carregarFechamentos();
    this.resetExport();
  }

  abrirDetalhesFechamento(fechamentoId: string) {
    this.service.buscarFechamentoPorIdBackend(fechamentoId).subscribe({
      next: fechamento => {
        this.service.fechamentoSelecionado = fechamento;
        const ref = this.dialog.open(DetalhesMembros, {
          disableClose: true,
        });
        this.resetExport();
      },
      error: err => {
        this.toast.show(`Erro ao encontrar fechamento: ${err.error?.erro}`);
      }
    });
  }

  exportar() {
    this.service.exportarZIP().subscribe((arquivo) => {
      const blob = new Blob([arquivo], {
        type: "application/zip"
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "fechamentos.zip";
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }

  toggleExport(fechamento: Fechamento, checked: boolean) {
    this.service.updateExport(fechamento.id!, checked).subscribe(() => {
      fechamento.export = checked;
    });
  }
}
