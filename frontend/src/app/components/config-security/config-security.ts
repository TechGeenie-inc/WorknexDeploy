import { Component, inject, OnInit } from '@angular/core';
import { LucideAngularModule, Shield } from 'lucide-angular';
import { SliderButton } from '../slider-button/slider-button';
import { Usuario } from '../popUps/add-user/usuario';
import { AuthService } from '../../services/auth-service';
import { ToastService } from '../../services/toast-service';

@Component({
  selector: 'app-config-security',
  imports: [LucideAngularModule, SliderButton],
  templateUrl: './config-security.html',
  styleUrl: './config-security.scss'
})
export class ConfigSecurity implements OnInit {
  private service = inject(AuthService);
  private toast = inject(ToastService);
  readonly Shield = Shield;

  usuario?: Usuario;

  ngOnInit() {
    this.service.loggedUser$.subscribe(u => this.usuario = u);
  }

  atualizar2FA() {
    if (!this.usuario) return;

    this.service.atualizar2FA(this.usuario).subscribe({
      next: () => {
        this.service.getLoggedUser().subscribe();
      },
      error: (err) => {
        this.toast.show("Erro ao ativar/desativar autenticação de dois fatores");
        console.error(err);
      }
    });
  }
}
