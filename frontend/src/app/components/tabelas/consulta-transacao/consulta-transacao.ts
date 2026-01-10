import { Dialog } from '@angular/cdk/dialog';
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { Download, LucideAngularModule, SquarePen, Trash2 } from 'lucide-angular';
import { PermissionService } from '../../../services/permission-service';
import { ToastService } from '../../../services/toast-service';
import { TransacaoService } from '../../../services/transacao-service';
import { AddTransacao } from '../../popUps/add-transacao/add-transacao';
import { Transacao } from '../../popUps/add-transacao/transacao';
import { ConfirmaDeletar } from '../../popUps/confirma-deletar/confirma-deletar';

@Component({
  selector: 'app-consulta-transacao',
  imports: [
    MatCardModule,
    MatIconModule,
    LucideAngularModule,
    MatTableModule,
    MatButtonModule,
    CommonModule,
    FormsModule
  ],
  templateUrl: './consulta-transacao.html',
  styleUrls: ['./consulta-transacao.scss']
})
export class ConsultaTransacao implements OnInit {
  readonly Trash2 = Trash2;
  readonly SquarePen = SquarePen;
  readonly Download = Download;

  private dialog = inject(Dialog);
  private service = inject(TransacaoService);
  private toast = inject(ToastService);
  perm = inject(PermissionService);

  termoBusca: string = '';
  columnsTable: string[] = ["data", "tipo", "categoria", "desc", "valor", "acoes"];

  listaTransacao: Transacao[] = [];
  listaTransacaoCompleta: Transacao[] = [];

  currentPage = 1;
  pageSize = 10;
  totalPages = 1;

  ngOnInit(): void {
    this.service.transacao$.subscribe((lista) => {
      this.listaTransacaoCompleta = lista;
      this.totalPages = Math.ceil(this.listaTransacaoCompleta.length / this.pageSize);
      this.currentPage = 1;
      this.atualizarLista();
    })
  }

  get transacoesPaginadas(): Transacao[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.listaTransacaoCompleta.slice(start, start + this.pageSize)
  }

  atualizarLista() {
    this.listaTransacao = this.transacoesPaginadas;
  }

  recarregarLista() {
    this.service.obterBackend().subscribe({
      next: (transacoes) => {
        this.listaTransacaoCompleta = transacoes.filter(t => t.isActive !== false);
        this.atualizarLista();
      },
      error: err => {
        if (err.status !== 403) {
          this.toast.show("Erro ao carregar lista de transações");
        }
      }
    });
  }

  preparaDeletar(transacao: Transacao) {
    if (!this.perm.can('fluxoDeCaixa', 'delete')) {
      this.toast.show("Sem permissão para deletar transações");
      return;
    }
    this.service.transacaoEmDelete = transacao;
    const ref = this.dialog.open(ConfirmaDeletar, {});
    ref.closed.subscribe(() => this.recarregarLista());
  }

  preparaEditar(id: string) {
    if (!this.perm.can('fluxoDeCaixa', 'edit')) {
      this.toast.show("Sem permissão para editar transações");
      return;
    }
    this.service.buscarClientePorIdBackend(id).subscribe({
      next: (transacao) => {
        this.service.transacaoEmEdicao = transacao;
        const ref = this.dialog.open(AddTransacao, {});
        ref.closed.subscribe(() => { this.recarregarLista(); })
      },
      error: err => {
        this.toast.show("Erro ao editar transação");
      }
    })
  }

  exportar() {
    this.service.exportarZIP().subscribe((arquivo) => {
      const blob = new Blob([arquivo], {
        type: "application/zip"
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "transacoes.zip";
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }
}
