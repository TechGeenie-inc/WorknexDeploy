import { Dialog } from '@angular/cdk/dialog';
import { switchMap, tap } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { Check, DollarSign, Download, LucideAngularModule, SquarePen, Trash2, X } from 'lucide-angular';
import { FaturaService } from '../../../services/fatura-service';
import { PermissionService } from '../../../services/permission-service';
import { ToastService } from '../../../services/toast-service';
import { AddFatura } from '../../popUps/add-fatura/add-fatura';
import { Fatura } from '../../popUps/add-fatura/fatura';
import { ConfirmaDeletar } from '../../popUps/confirma-deletar/confirma-deletar';
import { TransacaoService } from '../../../services/transacao-service';
import { SaldoService } from '../../../services/saldo-service';

@Component({
  selector: 'app-consulta-fatura',
  imports: [
    MatInputModule,
    MatTableModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    LucideAngularModule,
    FormsModule,
    CommonModule
  ],
  templateUrl: './consulta-fatura.html',
  styleUrl: './consulta-fatura.scss'
})
export class ConsultaFatura implements OnInit {
  private service = inject(FaturaService);
  private dialog = inject(Dialog);
  private toast = inject(ToastService);
  private transacaoService = inject(TransacaoService);
  private saldoService = inject(SaldoService);
  perm = inject(PermissionService);
  private readonly clienteLimite = 45;

  readonly X = X;
  readonly Check = Check;
  readonly SquarePen = SquarePen;
  readonly Trash2 = Trash2;
  readonly DollarSign = DollarSign;
  readonly Download = Download;

  columnsTable: string[] = ["fatura", "cliente", "valor", "vencimento", "pagamento", "status", "acoes"];
  termoBusca: string = '';
  filtroStatus?: 'pendente' | 'pago' | 'vencido';

  listaFatura: Fatura[] = [];
  listaFaturaCompleta: Fatura[] = [];

  currentPage = 1;
  pageSize = 10;
  totalPages = 1;

  ngOnInit(): void {
    this.service.fatura$.subscribe(lista => {
      this.listaFaturaCompleta = lista.filter(f => f.isActive !== false);
      this.totalPages = Math.ceil(this.listaFaturaCompleta.length / this.pageSize);
      this.currentPage = 1;
      this.atualizarLista();
    })
  }

  get faturasPaginadas(): Fatura[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.listaFaturaCompleta.slice(start, start + this.pageSize);
  }

  atualizarLista() {
    this.listaFatura = this.faturasPaginadas;
  }

  recarregarLista() {
    this.service.obterBackend().subscribe({
      next: (lista) => {
        this.listaFaturaCompleta = lista.filter(f => f.isActive !== false);
        this.service.carregarFaturas();
        this.atualizarLista();
      },
      error: err => {
        this.toast.show("Erro ao recarregar lista de faturas");
      }
    })
  }

  limparBusca() {
    this.termoBusca = ""
    this.recarregarLista()
  }

  preparaDeletar(fatura: Fatura) {
    if (!this.perm.can('faturamento', 'delete')) {
      this.toast.show("Sem permissão para deletar faturas");
      return;
    }
    this.service.faturaEmDelete = fatura;
    const ref = this.dialog.open(ConfirmaDeletar, {});
    ref.closed.subscribe(() => {
      this.recarregarLista();
      this.service.carregarFaturas();
    }
    );
  }

  preparaEditar(id: string) {
    if (!this.perm.can('faturamento', 'edit')) {
      this.toast.show("Sem permissão para editar faturas");
      return;
    }
    this.service.buscarFaturaPorIdBackend(id).subscribe({
      next: (fatura) => {
        this.service.faturaEmEdicao = fatura;
        const ref = this.dialog.open(AddFatura, {});
        ref.closed.subscribe(() => { this.recarregarLista(); });
      },
      error: err => {
        this.toast.show("Erro ao editar fatura");
      }
    })
  }

  alterarStatus(id: string) {
    this.service.buscarFaturaPorIdBackend(id).pipe(
      switchMap(fatura => {
        const novoStatus =
          fatura.status === 'pendente' || fatura.status === 'vencido'
            ? 'pago'
            : 'pendente';

        return this.service.setStatus(fatura.id!, novoStatus);
      }),
      tap(() => {
        this.recarregarLista();
        this.transacaoService.carregarTransacoes();
        this.saldoService.carregarSaldo();
      })
    ).subscribe({
      error: err => {
        if (err.status === 403) {
          this.toast.show('Sem permissão para atualizar status da fatura');
        } else {
          this.toast.show('Erro ao atualizar status da fatura');
        }
      }
    });
  }

  filtrarFaturas() {
    this.service.pesquisarFatura(this.termoBusca, this.filtroStatus).subscribe(faturas => {
      this.listaFaturaCompleta = faturas;
      this.totalPages = Math.ceil(this.listaFaturaCompleta.length / this.pageSize);
      this.currentPage = 1;
      this.atualizarLista();
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
      a.download = "faturas.zip";
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }
  truncateCliente(texto?: string): string {
    if (!texto) return '';
    if (texto.length <= this.clienteLimite) return texto;
    return `${texto.slice(0, this.clienteLimite).trimEnd()}...`;
  }
}
