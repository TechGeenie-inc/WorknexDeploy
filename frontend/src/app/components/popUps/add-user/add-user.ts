import { DialogRef } from '@angular/cdk/dialog';
import { CommonModule } from '@angular/common';
import { Component, inject, } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { Banknote, BookText, Boxes, Building2, Calendar, FileText, LucideAngularModule, Settings, User, Users, X } from 'lucide-angular';
import { AuthService } from '../../../services/auth-service';
import { ToastService } from '../../../services/toast-service';
import { SegmentedControl } from '../../segmented-control/segmented-control';
import { ModulePermissions, SelectCard } from '../select-card/select-card';
import { Role, Usuario } from './usuario';
@Component({
  selector: 'app-add-user',
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatInputModule,
    SegmentedControl,
    LucideAngularModule,
    SelectCard
  ],
  templateUrl: './add-user.html',
  styleUrl: './add-user.scss'
})
export class AddUser {
  usuario: Usuario = Usuario.newUsuario();
  atualizando = false;
  Role = Role;
  userIsOpen: boolean = true;
  roleSelecionada: boolean = false;


  readonly User = User;
  readonly Users = Users;
  readonly Banknote = Banknote;
  readonly Building2 = Building2;
  readonly Calendar = Calendar;
  readonly FileText = FileText;
  readonly BookText = BookText;
  readonly Settings = Settings;
  readonly Boxes = Boxes;
  readonly X = X;


  private dialogRef = inject(DialogRef);
  private service = inject(AuthService);
  private toast = inject(ToastService);

  constructor() {
    if (this.service.usuarioEmEdicao) {
      this.usuario = { ...this.service.usuarioEmEdicao };
      this.atualizando = true;
    }

    if (this.usuario.role) {
      this.verificarRole(this.usuario.role);
    }

    this.usuario.permissions = {
      membros: this.usuario.permissions?.['membros'] || { view: false, create: false, edit: false, delete: false },
      equipes: this.usuario.permissions?.['equipes'] || { view: false, create: false, edit: false, delete: false },
      funcoes: this.usuario.permissions?.['funcoes'] || { view: false, create: false, edit: false, delete: false },
      clientes: this.usuario.permissions?.['clientes'] || { view: false, create: false, edit: false, delete: false },
      agenda: this.usuario.permissions?.['agenda'] || { view: false, create: false, edit: false, delete: false },
      faturamento: this.usuario.permissions?.['faturamento'] || { view: false, create: false, edit: false, delete: false },
      fechamento: this.usuario.permissions?.['fechamento'] || { view: false, create: false, edit: false, delete: false },
      fluxoDeCaixa: this.usuario.permissions?.['fluxoDeCaixa'] || { view: false, create: false, edit: false, delete: false },
      configuracoes: this.usuario.permissions?.['configuracoes'] || { view: false, create: false, edit: false, delete: false },
    };
  }

  adicionarUsuario() {
    this.service.cadastrarUsuario(this.usuario).subscribe({
      next: () => {
        this.service.carregarUsuarios();
        this.closeModal();
      },
      error: err => {
        this.toast.show("Erro ao adicionar usuário");
      }
    })
  }

  atualizarUsuario() {
    this.service.atualizarBackend(this.usuario).subscribe({
      next: () => {
        this.service.usuarioEmEdicao = undefined;
        this.dialogRef?.close();
      },
      error: (err) => {
        this.toast.show("Erro ao atualizar usuário");
      }
    });
  }

  verificarEmail() {
    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.usuario.email!);

    if (!emailValido) {
      alert("Email inválido");
      return;
    }

    if (!this.usuario.role) {
      alert("Selecione um nível de acesso.");
      return;
    }
    this.service.verificarEmail(this.usuario).subscribe(
      res => {
        if (res.exists) {
          alert("Email já cadastrado!")
          return;
        }
        this.adicionarUsuario();
      }
    );
  }

  private defaultModule(): ModulePermissions {
    return {
      view: false,
      create: false,
      edit: false,
      delete: false,
    };
  }

  verificarRole(role: Role) {
    const allPerms = {
      membros: this.defaultModule(),
      equipes: this.defaultModule(),
      funcoes: this.defaultModule(),
      clientes: this.defaultModule(),
      agenda: this.defaultModule(),
      faturamento: this.defaultModule(),
      fechamento: this.defaultModule(),
      fluxoDeCaixa: this.defaultModule(),
      configuracoes: this.defaultModule(),
    }

    const keys = Object.keys(allPerms) as Array<keyof typeof allPerms>;

    if (role === Role.admin) {
      keys.forEach(k => {
        allPerms[k] = { view: true, create: true, edit: true, delete: true };
      });
      this.roleSelecionada = true;
    }

    if (role === Role.gerente) {
      keys.forEach(k => {
        allPerms[k] = { view: true, create: true, edit: true, delete: true };
      });
      allPerms.configuracoes = { view: true, create: false, edit: false, delete: false };
      this.roleSelecionada = true;
    }

    if (role === Role.visualizador) {
      keys.forEach(k => {
        allPerms[k] = { view: true, create: false, edit: false, delete: false };
      });
      this.roleSelecionada = true;
    }

    if (role === Role.personalizado) {
      this.roleSelecionada = false;
      return;
    }

    this.usuario.permissions = allPerms;
  }

  onSelectionChange(index: number) {
    this.userIsOpen = index === 0;
  }

  onPermissionsChange(moduleName: string, perms: ModulePermissions) {
    this.usuario.permissions![moduleName] = perms;
  }

  protected closeModal() {
    this.dialogRef?.close();
  }

}
