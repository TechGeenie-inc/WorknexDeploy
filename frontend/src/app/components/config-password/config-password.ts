import { Component, inject } from '@angular/core';
import { Key, LucideAngularModule, Save } from 'lucide-angular';
import { MainButton } from '../main-button/main-button';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth-service';
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
  private authService = inject(AuthService);
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
      this.toast.show("Senhas novas não coincidem");
      return;
    }

    this.authService.changeMyPassword(this.oldPassword, this.newPassword).subscribe({
      next: (res) => {
        this.toast.show("Senha alterada com sucesso!");
        this.oldPassword = "";
        this.newPassword = "";
        this.confirmNewPassword = "";
      },
      error: (err) => {
        this.toast.show(`Erro ao atualizar senha: ${err.error?.erro}`);
      }
    })
  }
}
