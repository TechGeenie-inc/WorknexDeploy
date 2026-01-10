import { Dialog } from '@angular/cdk/dialog';
import { CommonModule } from '@angular/common';
import { Component, DOCUMENT, inject, Renderer2 } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { Building2, LucideAngularModule } from 'lucide-angular';
import { MainButton } from '../../components/main-button/main-button';
import { Usuario } from '../../components/popUps/add-user/usuario';
import { AuthService, LoginResponse } from '../../services/auth-service';
import { ToastService } from '../../services/toast-service';

@Component({
  selector: 'app-pg-login',
  imports: [
    FormsModule,
    CommonModule,
    MatInputModule,
    LucideAngularModule,
    MainButton
  ],
  templateUrl: './pg-login.html',
  styleUrl: './pg-login.scss'
})
export class PgLogin {
  user: Usuario = Usuario.newUsuario();

  service = inject(AuthService);
  dialog = inject(Dialog);
  private toast = inject(ToastService);
  email2FA = '';
  etapa2FA = false;
  codigo2FA = '';

  private renderer = inject(Renderer2);
  private document = inject(DOCUMENT);

  readonly Building = Building2;

  ngOnInit(): void {
    this.renderer.addClass(this.document.body, 'page-login');
  }

  ngOnDestroy(): void {
    this.renderer.removeClass(this.document.body, 'page-login');
  }

  login() {
    this.service.login(this.user).subscribe({
      next: (res: LoginResponse) => {
        if (res.token) {
          window.location.href = "/";
        } else if (res.etapa === '2FA') {
          this.etapa2FA = true;
          this.email2FA = res.email!;
        } else {
          this.toast.show("Erro ao verificar Login");
        }
      },
      error: err => {
        this.toast.show("Erro ao realizar login");
      }
    });
  }

  validar2FA() {
    this.service.verificar2FA({ email: this.email2FA, codigo: this.codigo2FA }).subscribe({
      next: res => {
        if (res.token) {
          localStorage.setItem('AUTH_TOKEN', res.token);
          window.location.href = "/";
        } else {
          this.toast.show("Código de autenticação de dois fatores inválido");
        }
      },
      error: err => {
        this.toast.show("Erro ao verificar código de autenticação de dois fatores");
      }
    })
  }
}
