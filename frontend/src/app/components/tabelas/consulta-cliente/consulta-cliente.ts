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
import { Download, LucideAngularModule, SquarePen, Trash2 } from 'lucide-angular';
import { ClienteService } from '../../../services/cliente-service';
import { PermissionService } from '../../../services/permission-service';
import { ToastService } from '../../../services/toast-service';
import { AddCliente } from '../../popUps/add-cliente/add-cliente';
import { Cliente } from '../../popUps/add-cliente/cliente';
import { ConfirmaDeletar } from '../../popUps/confirma-deletar/confirma-deletar';

@Component({
  selector: 'app-consulta-cliente',
  imports: [
    MatCardModule,
    MatInputModule,
    MatTableModule,
    CommonModule,
    FormsModule,
    MatIconModule,
    LucideAngularModule,
    MatButtonModule,
    MatTooltipModule
  ],
  templateUrl: './consulta-cliente.html',
  styleUrls: ['./consulta-cliente.scss']
})
export class ConsultaCliente implements OnInit {
  readonly Trash2 = Trash2;
  readonly SquarePen = SquarePen;
  readonly Download = Download;

  private dialog = inject(Dialog);
  private service = inject(ClienteService);
  private toast = inject(ToastService);
  perm = inject(PermissionService);

  private readonly nomeLimite = 80;
  private readonly emailLimite = 35;

  termoBusca: string = '';
  columnsTable: string[] = ["cliente", "contato", "empresa", "projetos", "status", "cadastro", "acoes"];

  listaClientes: Cliente[] = [];
  listaClientesCompleta: Cliente[] = [];
  listaClientesFiltrada: Cliente[] = [];

  currentPage = 1;
  pageSize = 10;
  totalPages = 1;

  ngOnInit(): void {
    this.service.cliente$.subscribe({
      next: (lista) => {
        this.listaClientesCompleta = lista.filter(c => c.isActive !== false);
        this.aplicarBusca();
      },
      error: (err) => {
        if (err.status !== 403) {
          this.toast.show("Erro ao carregar lista de clientes");
        }
      }
    });
  }

  truncate(texto?: string, limite = this.nomeLimite): string {
    if (!texto) return '';
    if (texto.length <= limite) return texto;
    return `${texto.slice(0, limite).trimEnd()}...`;
  }
  truncateEmail(texto?: string): string {
    return this.truncate(texto, this.emailLimite);
  }

  get clientesPaginados(): Cliente[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.listaClientesFiltrada.slice(start, start + this.pageSize);
  }

  atualizarLista() {
    this.listaClientes = this.clientesPaginados;
  }

  recarregarLista() {
    this.service.obterBackend().subscribe({
      next: (clientes) => {
        this.listaClientesCompleta = clientes.filter(c => c.isActive !== false);
        this.aplicarBusca();
        this.service.carregarClientes();
      },
      error: (err) => {
        this.toast.show("Erro ao recarregar lista");
      }
    });
  }

  preparaDeletar(clientepj: Cliente) {
    if (!this.perm.can('clientes', 'delete')) {
      this.toast.show("Sem permissão para deletar clientes");
      return;
    }
    this.service.clienteEmDelete = clientepj;
    const ref = this.dialog.open(ConfirmaDeletar, {});
    ref.closed.subscribe(() => this.recarregarLista());
  }


  preparaEditar(id: string) {
    if (!this.perm.can('clientes', 'edit')) {
      this.toast.show("Sem permissão para editar clientes");
      return;
    }
    this.service.buscarClientePorIdBackend(id).subscribe({
      next: (cliente) => {
        this.service.clienteEmEdicao = cliente;
        const ref = this.dialog.open(AddCliente, {});
        ref.closed.subscribe(() => this.recarregarLista());
      },
      error: (err) => {
        this.toast.show("Erro ao editar cliente");
      }
    });
  }

  listarAtivos() {
    const listaAtivos = this.listaClientesCompleta.filter(
      c => c.isActive !== false && c.projetosAtivos > 0
    );
    this.listaClientesCompleta = listaAtivos;
    this.aplicarBusca();
  }

  maskPhone(value: string): string {
    if (!value) return '';
    return value
      .replace(/\D/g, '')
      .replace(/^(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d{5})$/, '$1-$2');
  }

  criarAvatar(clienteNome: string): string {
    const n = clienteNome;
    return n.split(' ').map(s => s[0]).slice(0, 2).join('').toUpperCase();
  }

  buscaLive(valor: string) {
    this.termoBusca = valor;
    this.aplicarBusca();
  }

  limparBusca() {
    this.termoBusca = '';
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
      a.download = "clientes.zip";
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }

  private aplicarBusca() {
    const termo = this.termoBusca.trim().toLowerCase();
    if (!termo) {
      this.listaClientesFiltrada = [...this.listaClientesCompleta];
    } else {
      this.listaClientesFiltrada = this.listaClientesCompleta.filter(cliente => this.correspondeBusca(cliente, termo));
    }
    this.totalPages = Math.ceil(this.listaClientesFiltrada.length / this.pageSize) || 1;
    this.currentPage = 1;
    this.atualizarLista();
  }

  private correspondeBusca(cliente: Cliente, termo: string): boolean {
    const campos = [
      cliente.nomeCompleto,
      cliente.nomeFantasia,
      cliente.razaoSocial,
      cliente.contato,
      cliente.email,
      cliente.cidade,
      cliente.estado,
      cliente.cnpj,
      cliente.cpf
    ];
    return campos.some(campo => campo?.toLowerCase().includes(termo));
  }

}
