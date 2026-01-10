import { Component, inject } from '@angular/core';
import { Key, LucideAngularModule, Save } from 'lucide-angular';
import { MainButton } from '../main-button/main-button';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth-service';
import { ChangeRequestService } from '../../services/change-request-service';
import { ToastService } from '../../services/toast-service';

@Component({
  selector: 'app-config-password',
  imports: [
    LucideAngularModule,
    MainButton,
    FormsModule
  ],
  templateUrl: './config-password.html',
  styleUrl: './config-password.scss'
})
export class ConfigPassword {
  private requestService = inject(ChangeRequestService);
  private toast = inject(ToastService);
  readonly Key = Key;
  readonly Save = Save;

  oldPassword: string = "";
  newPassword: string = "";
  confirmNewPassword: string = "";

  saveInfo() {
    if (!this.oldPassword || !this.newPassword || !this.confirmNewPassword) {
      this.toast.show("Preencha todos os campos");
      return;
    }

    if (this.newPassword !== this.confirmNewPassword) {
      this.toast.show("Senhas não coincidem");
      return;
    }
    this.requestService.solicitar("password", {
      oldPassword: this.oldPassword,
      novaSenha: this.newPassword
    }).subscribe({
      next: (res) => {
        this.toast.show("Solicitação de atualização enviada");

        this.oldPassword = "";
        this.newPassword = "";
        this.confirmNewPassword = "";
      },
      error: (err) => {
        this.toast.show("Erro ao atualizar senha");
      }
    })
  }
}
