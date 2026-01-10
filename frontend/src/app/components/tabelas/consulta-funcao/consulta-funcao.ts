import { Dialog } from '@angular/cdk/dialog';
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Download, LucideAngularModule, SquarePen, Trash2 } from 'lucide-angular';
import { FuncaoService } from '../../../services/funcao-service';
import { MembroService } from '../../../services/membro-service';
import { PermissionService } from '../../../services/permission-service';
import { ToastService } from '../../../services/toast-service';
import { AddFuncao } from '../../popUps/add-funcao/add-funcao';
import { Funcao } from '../../popUps/add-funcao/funcao';
import { Membro } from '../../popUps/add-member/membro';
import { ConfirmaDeletar } from '../../popUps/confirma-deletar/confirma-deletar';

@Component({
  selector: 'app-consulta-funcao',
  imports: [
    MatCardModule,
    MatInputModule,
    MatTableModule,
    FormsModule,
    CommonModule,
    MatIcon,
    LucideAngularModule,
    MatButtonModule,
    MatTooltipModule
  ],
  templateUrl: './consulta-funcao.html',
  styleUrl: './consulta-funcao.scss'
})
export class ConsultaFuncao implements OnInit {
  readonly Trash2 = Trash2;
  readonly SquarePen = SquarePen;
  readonly Download = Download;
  private readonly funcaoLimite = 50;
  private dialog = inject(Dialog);
  private service = inject(FuncaoService);
  private serviceMembro = inject(MembroService);
  private toast = inject(ToastService);
  perm = inject(PermissionService);

  termoBusca: string = '';
  columnsTable: string[] = ["funcao", "quantidade", "acoes",];
  listaMembros: Membro[] = [];

  listaFuncoes: Funcao[] = [];
  listaFuncoesCompleta: Funcao[] = [];
  listaFuncoesFiltradas: Funcao[] = [];

  currentPage = 1;
  pageSize = 10;
  totalPages = 1;

  ngOnInit() {
    this.service.funcao$.subscribe({
      next: lista => {
        this.listaFuncoesCompleta = lista.filter(f => f.isActive !== false);
        this.aplicarBusca();
      },
      error: (err) => {
        if (err.status !== 403) {
          this.toast.show("Erro ao carregar lista de funções");
        }
      }
    });

    this.serviceMembro.membros$.subscribe(lista => {
      this.listaMembros = lista.filter(m => m.isActive !== false);
    });
  }

  get funcoesPaginadas(): Funcao[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.listaFuncoesFiltradas.slice(start, start + this.pageSize)
  }

  atualizarLista() {
    this.listaFuncoes = this.funcoesPaginadas;
  }

  buscaLive(valor: string) {
    this.termoBusca = valor;
    this.aplicarBusca();
  }

  recarregarLista() {
    this.service.obterBackend().subscribe({
      next: (funcoes) => {
        this.listaFuncoesCompleta = funcoes.filter(f => f.isActive !== false);
        this.aplicarBusca();
      },
      error: err => {
        this.toast.show("Erro ao listar funções");
      }
    });
  }

  limparBusca() {
    this.termoBusca = '';
    this.aplicarBusca();
  }

  truncateFuncao(texto?: string): string {
    if (!texto) return '';
    if (texto.length <= this.funcaoLimite) return texto;
    return `${texto.slice(0, this.funcaoLimite).trimEnd()}...`;
  }

  preparaDeletar(funcao: Funcao) {
    if (!this.perm.can('funcoes', 'delete')) {
      this.toast.show("Sem permissão para deletar funções");
      return;
    }
    this.service.funcaoEmDelete = funcao;
    const ref = this.dialog.open(ConfirmaDeletar, {});
    ref.closed.subscribe(() => this.recarregarLista());
  }

  preparaEditar(id: string) {
    if (!this.perm.can('funcoes', 'edit')) {
      this.toast.show("Sem permissão para editar funções");
      return;
    }
    this.service.buscarFuncaoPorIdBackend(id).subscribe({
      next: (funcao) => {
        this.service.funcaoEmEdicao = funcao;
        const ref = this.dialog.open(AddFuncao, {});
        ref.closed.subscribe(() => this.recarregarLista());
      },
      error: err => {
        this.toast.show("Erro ao editar função");
      }
    });
  }

  calculoQuantidade(funcao: Funcao): number {
    const numeroCadastrado = this.listaMembros.filter(m => m.funcaoId === funcao.id).length;
    return numeroCadastrado;
  }

  filtrarPorQuantidade(membrosMin: number, membrosMax?: number) {
    this.service.funcao$.subscribe(lista => {
      this.listaFuncoesCompleta = lista.filter(f => f.isActive !== false);
    })
    const listaFiltrada = this.listaFuncoesCompleta.filter(funcao => {
      const qtd = this.calculoQuantidade(funcao);
      if (membrosMax !== undefined) {
        return qtd >= membrosMin && qtd <= membrosMax;
      }
      return qtd >= membrosMin;
    });

    this.listaFuncoesCompleta = listaFiltrada;
    this.aplicarBusca();
  }

  exportar() {
    this.service.exportarZIP().subscribe((arquivo) => {
      const blob = new Blob([arquivo], {
        type: "application/zip"
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "funcoes.zip";
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }

  private aplicarBusca() {
    const termo = this.termoBusca.trim().toLowerCase();
    if (!termo) {
      this.listaFuncoesFiltradas = [...this.listaFuncoesCompleta];
    } else {
      this.listaFuncoesFiltradas = this.listaFuncoesCompleta.filter(funcao => this.correspondeBusca(funcao, termo));
    }
    this.totalPages = Math.ceil(this.listaFuncoesFiltradas.length / this.pageSize) || 1;
    this.currentPage = 1;
    this.atualizarLista();
  }

  private correspondeBusca(funcao: Funcao, termo: string): boolean {
    const nome = funcao.nomeFuncao?.toLowerCase() ?? '';
    if (nome.includes(termo)) {
      return true;
    }
    const quantidade = this.calculoQuantidade(funcao).toString();
    return quantidade.includes(termo);
  }
}
