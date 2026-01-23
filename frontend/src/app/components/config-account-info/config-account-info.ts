import { Component, inject } from '@angular/core';
import { LucideAngularModule, PencilRuler, Save, User } from 'lucide-angular';
import { MainButton } from '../main-button/main-button';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth-service';
import { ChangeRequestService } from '../../services/change-request-service';
import { Usuario } from '../popUps/add-user/usuario';
import { ToastService } from '../../services/toast-service';

@Component({
  selector: 'app-config-account-info',
  imports: [
    LucideAngularModule,
    MainButton,
    FormsModule,
  ],
  templateUrl: './config-account-info.html',
  styleUrl: './config-account-info.scss'
})
export class ConfigAccountInfo {

  private authService = inject(AuthService);
  private toast = inject(ToastService);
  readonly User = User;
  readonly Save = Save;
  readonly PencilRuler = PencilRuler;

  isEditing: boolean = false;
  nome: string = "";
  email: string = "";

  user: Usuario = Usuario.newUsuario();

  constructor() {
    this.authService.getLoggedUser().subscribe({
      next: (user) => {
        this.user = user;
      }
    });
  }

  editInfo() {
    this.isEditing = true;
  }

  saveInfo() {
    this.authService.changeMyData(this.user.nome!, this.user.email!).subscribe({
      next: (res) => {
        this.isEditing = false;
        this.toast.show("Informações alteradas com sucesso!");
      },
      error: (err) => {
        this.toast.show(`Erro ao alterar informações: ${err.error?.erro}`);
      }
    })
  }

}
