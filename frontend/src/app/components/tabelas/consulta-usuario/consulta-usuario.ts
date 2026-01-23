import { Dialog } from '@angular/cdk/dialog';
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Crown, Eye, LucideAngularModule, Settings, Shield, SquarePen, Trash2, User, UserPlus } from 'lucide-angular';
import { AuthService } from '../../../services/auth-service';
import { PermissionService } from '../../../services/permission-service';
import { MainButton } from '../../main-button/main-button';
import { AddUser } from '../../popUps/add-user/add-user';
import { Usuario } from '../../popUps/add-user/usuario';
import { SliderButton } from '../../slider-button/slider-button';
import { ToastService } from '../../../services/toast-service';
import { ConfirmaDeletar } from '../../popUps/confirma-deletar/confirma-deletar';

@Component({
  selector: 'app-consulta-usuario',
  imports: [
    MainButton,
    LucideAngularModule,
    FormsModule,
    MatTableModule,
    MatCardModule,
    CommonModule,
    SliderButton,
  ],
  templateUrl: './consulta-usuario.html',
  styleUrl: './consulta-usuario.scss'
})
export class ConsultaUsuario implements OnInit {
  readonly UserPlus = UserPlus;
  readonly SquarePen = SquarePen;
  readonly Trash2 = Trash2;
  readonly Shield = Shield;
  readonly User = User;
  readonly Eye = Eye;
  readonly Settings = Settings;
  readonly Crown = Crown;

  private service = inject(AuthService);
  private dialog = inject(Dialog);
  perm = inject(PermissionService);
  private toast = inject(ToastService);

  disabled = !!(!this.perm.can('configuracoes', 'edit'));

  columnsTable: string[] = ["usuario", "nivelDeAcesso", "status", "ultimoLogin", "acoes"];
  listaUsuarios: Usuario[] = [];
  listaUsuariosCompleta: Usuario[] = [];
  dataSource = new MatTableDataSource<Usuario>();

  currentPage = 1;
  pageSize = 5;
  totalPages = 1;

  ngOnInit(): void {
    this.service.usuario$.subscribe({
      next: (lista) => {
        this.listaUsuariosCompleta = lista;
        this.dataSource.data = lista;
        this.totalPages = Math.ceil(this.listaUsuariosCompleta.length / this.pageSize);
        this.currentPage = 1;
        this.atualizarLista();
      },
      error: err => {
        if (err.status !== 403) {
          this.toast.show(`Erro ao carregar lista de usuários: ${err.error?.erro}`);
        }
      }
    });
  }

  get usuariosPaginados(): Usuario[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.listaUsuariosCompleta.slice(start, start + this.pageSize);
  }

  atualizarLista() {
    this.dataSource.data = this.usuariosPaginados;
  }

  recarregarLista() {
    this.service.obterBackend().subscribe({
      next: (usuarios) => {
        this.listaUsuariosCompleta = usuarios;
        this.atualizarLista();
      },
      error: err => {
        if (err.status !== 403) {
          this.toast.show(`Erro ao carregar lista de usuários: ${err.error?.erro}`);
        }
      }
    });
  }

  trackByUsuario(_index: number, usuario: Usuario) {
    return usuario.id;
  }

  toggleUsuario(user: Usuario) {
    if (!this.perm.can('configuracoes', 'edit')) {
      this.toast.show("Sem permissão para editar usuários");
      return;
    }
    if (user.isActive === true) {
      this.service.desativar(user).subscribe({
        next: () => {
          this.toast.show("Usuário desativado com sucesso");
          this.service.carregarUsuarios();
        },
        error: err => {
          if (err.status === 403) {
            this.toast.show("Sem permissão para desativar usuário");
            return;
          }
          this.toast.show(`Erro ao desativar usuário: ${err.error?.erro}`);
          console.error(err);
        }
      });
    }

    if (user.isActive === false) {
      this.service.reativarUsuario(user).subscribe({
        next: () => {
          this.toast.show("Usuário ativado com sucesso");
          this.service.carregarUsuarios();
        },
        error: err => {
          this.toast.show(`Erro ao reativar usuário: ${err.error?.erro}`);
        }
      });
    }
  }

  preparaEditar(id: string) {
    if (!this.perm.can('configuracoes', 'edit')) {
      this.toast.show("Sem permissão para editar usuários");
      return;
    }
    this.service.buscarUsuarioPorIdBackend(id).subscribe({
      next: (usuario) => {
        if (usuario.role === "adminMaster" as any) {
          this.toast.show("Administrador de origem não pode ser editado!");
          return;
        }
        this.service.usuarioEmEdicao = usuario;
        const ref = this.dialog.open(AddUser, {});
        ref.closed.subscribe(() => this.recarregarLista());
      },
      error: err => {
        if (err.status === 403) {
          this.toast.show("Sem permissão para editar usuários");
        } else {
          this.toast.show(`Erro ao atualizar usuário: ${err.error?.erro}`);
        }
      }
    });
  }

  preparaDeletar(usuario: Usuario) {
    if (!this.perm.can('configuracoes', 'delete')) {
      this.toast.show("Sem permissão para deletar usuários");
      return;
    }
    if (usuario.role === "adminMaster" as any) {
      this.toast.show("Administrador de origem não pode ser deletado!");
      return;
    }
    this.service.usuarioEmDelete = usuario;
    const ref = this.dialog.open(ConfirmaDeletar, {});
    ref.closed.subscribe(() => {
      this.recarregarLista();
      this.service.carregarUsuarios();
    });
  }

  protected openModal() {
    this.service.usuarioEmEdicao = undefined;
    const ref = this.dialog.open(AddUser, { disableClose: true });

    ref.closed.subscribe((novoUsuario) => {
      const usuario = novoUsuario as Usuario | undefined;
      if (novoUsuario) {
        this.recarregarLista();
      }
    });
  }

}
