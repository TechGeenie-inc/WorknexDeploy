import { CommonModule } from '@angular/common';
import { Component, DOCUMENT, inject, Renderer2 } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { Building2, LucideAngularModule } from 'lucide-angular';
import { MainButton } from '../../components/main-button/main-button';
import { Usuario } from '../../components/popUps/add-user/usuario';
import { AuthService, LoginResponse } from '../../services/auth-service';
import { ToastService } from '../../services/toast-service';
import { ActivatedRoute, Router } from '@angular/router';


type LoginMode = 'login' | '2fa' | 'forgot' | 'reset';
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
  private toast = inject(ToastService);

  private renderer = inject(Renderer2);
  private document = inject(DOCUMENT);

  private route = inject(ActivatedRoute);
  private router = inject(Router);

  readonly Building = Building2;

  mode: LoginMode = 'login';

  email2FA = '';
  codigo2FA = '';

  emailForgot = ''
  tokenReset = ''
  newPassword = ''
  confirmNewPassword = ''


  ngOnInit(): void {
    this.renderer.addClass(this.document.body, 'page-login');

    this.route.queryParamMap.subscribe(params => {
      const token = params.get('token');
      if (token) {
        this.tokenReset = token;
        this.mode = 'reset';
      } 

      this.router.navigate([], {
        queryParams: { token: null },
        queryParamsHandling: 'merge',
        replaceUrl: true
      })
    });
  }

  ngOnDestroy(): void {
    this.renderer.removeClass(this.document.body, 'page-login');
  }

  goLogin() {
    this.mode = 'login';
    this.codigo2FA = '';
    this.email2FA = '';

    this.router.navigate([], { queryParams: { token: null }, queryParamsHandling: 'merge' });
    this.tokenReset = '';
    this.newPassword = '';
    this.confirmNewPassword = '';
  }

  goForgot() {
    this.mode = 'forgot';
    this.emailForgot = this.user.email || '';
  }

  login() {
    this.service.login(this.user).subscribe({
      next: (res: LoginResponse) => {

        if (res.token) {
          window.location.href = "/";
          return;
        }

        if (res.etapa === '2FA') {
          this.mode = '2fa';
          this.email2FA = res.email!;
          return;
        }

        this.toast.show("Erro ao verificar Login");

      },
      error: err => {
        this.toast.show(`Erro ao realizar login: ${err.error?.erro}`);
      }
    });
  }

  validar2FA() {
    this.service.verificar2FA({ email: this.email2FA, codigo: this.codigo2FA }).subscribe({
      next: res => {
        if (res.token) {
          localStorage.setItem('AUTH_TOKEN', res.token);
          window.location.href = "/";
          return;
        }

        this.toast.show("Código de autenticação de dois fatores inválido");

      },
      error: err => {
        this.toast.show("Erro ao verificar código de autenticação de dois fatores");
      }
    });
  }

  sendResetMail() {
    if (!this.emailForgot) {
      this.toast.show("Digite seu e-mail");
      return;
    }

    this.service.forgotPassword(this.emailForgot).subscribe({
      next: () => {
        this.toast.show("Se o email informado estiver cadastrado, as instruções serão enviadas para ele.");
        this.goLogin();
      },
      error: (err) => {
        this.toast.show(`Erro ao enviar e-mail de recuperação: ${err.error?.erro}`);
      }
    });
  }

  resetPassword() {
    if (!this.tokenReset) {
      this.toast.show("Token inválido.");
      this.goLogin();
      return;
    }

    if (!this.newPassword || !this.confirmNewPassword) {
      this.toast.show("Preencha todos os campos");
      return;
    }

    if (this.newPassword !== this.confirmNewPassword) {
      this.toast.show("Senhas não coincidem");
      return;
    }

    this.service.resetPassword(this.tokenReset, this.newPassword).subscribe({
      next: () => {
        this.toast.show("Senha redefinida com sucesso! Faça login.");
        this.goLogin();
      },
      error: (err) => {
        this.toast.show(`Erro ao redefinir senha: ${err.error?.erro}`);
      }
    });
  }

}

