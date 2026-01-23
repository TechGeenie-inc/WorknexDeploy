import { Dialog } from '@angular/cdk/dialog';
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { Download, LucideAngularModule, SquarePen, Trash2 } from 'lucide-angular';
import { MembroService } from '../../../services/membro-service';
import { PermissionService } from '../../../services/permission-service';
import { ToastService } from '../../../services/toast-service';
import { AddMember } from '../../popUps/add-member/add-member';
import { Membro } from '../../popUps/add-member/membro';
import { ConfirmaDeletar } from '../../popUps/confirma-deletar/confirma-deletar';

@Component({
  selector: 'app-consulta-membro',
  imports: [
    MatCardModule,
    MatInputModule,
    MatTableModule,
    CommonModule,
    FormsModule,
    MatIconModule,
    LucideAngularModule,
    MatButtonModule,
  ],
  templateUrl: './consulta-membro.html',
  styleUrl: './consulta-membro.scss'
})
export class ConsultaMembro implements OnInit {
  readonly Trash2 = Trash2;
  readonly SquarePen = SquarePen;
  readonly Download = Download;


  private dialog = inject(Dialog);
  private service = inject(MembroService);
  private toast = inject(ToastService);
  perm = inject(PermissionService);

  termoBusca: string = '';
  columnsTable: string[] = ["nome", "cpf", "celular", "cargo", "precoHora", "precoVenda", "status", "acoes"];

  listaMembros: Membro[] = [];
  listaMembrosCompleta: Membro[] = [];

  filtroStatus?: 'ativo' | 'inativo';
  currentPage = 1;
  pageSize = 10;
  totalPages = 1;

  ngOnInit() {
    this.service.membros$.subscribe((lista) => {
      const previousPage = this.currentPage || 1;
      this.listaMembrosCompleta = lista.filter(m => m.isActive !== false);
      this.totalPages = Math.max(1, Math.ceil(this.listaMembrosCompleta.length / this.pageSize));
      this.currentPage = Math.min(previousPage, this.totalPages);
      this.atualizarLista();
    });
  }

  get membrosPaginados(): Membro[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.listaMembrosCompleta.slice(start, start + this.pageSize);
  }

  atualizarLista() {
    this.listaMembros = this.membrosPaginados;
  }

  recarregarLista() {
    this.service.obterBackend().subscribe({
      next: (membros) => {
        this.listaMembrosCompleta = membros.filter(m => m.isActive !== false);
        this.atualizarLista();
      },
      error: (err) => {
        if (err.status !== 403) {
          this.toast.show(`Erro ao carregar lista de membros: ${err.error?.erro}`);
        }
      }
    });
  }

  limparBusca() {
    this.termoBusca = '';
    this.filtrarMembros();
  }

  buscaLive(valor: string) {
    this.termoBusca = valor;
    this.filtrarMembros();
  }

  preparaDeletar(membro: Membro) {
    if (!this.perm.can('membros', 'delete')) {
      this.toast.show("Sem permissão para deletar membros");
      return;
    }
    this.service.membroEmDelete = membro;
    const ref = this.dialog.open(ConfirmaDeletar, {});
    ref.closed.subscribe(() => this.recarregarLista());
  }

  preparaEditar(id: string) {
    if (!this.perm.can('membros', 'edit')) {
      this.toast.show("Sem permissão para editar membros");
      return;
    }

    this.service.buscarMembroPorIdBackend(id).subscribe({
      next: (membro) => {
        this.service.membroEmEdicao = membro;
        if (membro.tipoPagamento === null) membro.tipoPagamento = undefined;
        console.log(membro);
        const ref = this.dialog.open(AddMember, {});
        ref.closed.subscribe(() => this.recarregarLista());
      },
      error: (err) => {
        this.toast.show(`Erro ao editar membro: ${err.error?.erro}`);
      }
    });
  }

  filtrarMembros() {
    this.service.pesquisarMembro(this.termoBusca, {
      status: this.filtroStatus
    }).subscribe(membros => {
      this.listaMembrosCompleta = membros;
      this.totalPages = Math.ceil(this.listaMembrosCompleta.length / this.pageSize);
      this.currentPage = 1;
      this.atualizarLista();
    });
  }

  alterarStatus(membro: Membro) {
    this.service.setStatus(membro.id!, membro.status as 'ativo' | 'inativo');
    this.recarregarLista();
  }

  maskCpf(value: string): string {
    if (!value) return '';
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  }

  maskPhone(value: string): string {
    if (!value) return '';
    return value
      .replace(/\D/g, '')
      .replace(/^(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d{5})$/, '$1-$2');
  }

  exportar() {
    this.service.exportarZIP().subscribe((arquivo) => {
      const blob = new Blob([arquivo], {
        type: "application/zip"
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "membros.zip";
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }
}
