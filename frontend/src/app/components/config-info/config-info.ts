import { Component, inject } from '@angular/core';
import { Building2, LucideAngularModule, PencilRuler, Save } from 'lucide-angular';
import { MainButton } from '../main-button/main-button';
import { Config } from './config';
import { ConfigService } from '../../services/config-service';
import { FormsModule } from '@angular/forms';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { ToastService } from '../../services/toast-service';
import { PermissionService } from '../../services/permission-service';

@Component({
  selector: 'app-config-info',
  imports: [
    MainButton,
    LucideAngularModule,
    FormsModule,
    NgxMaskDirective
  ],
  providers: [
    provideNgxMask(),
  ],
  templateUrl: './config-info.html',
  styleUrl: './config-info.scss'
})
export class ConfigInfo {

  private service = inject(ConfigService);
  private toast = inject(ToastService);
  perm = inject(PermissionService);
  readonly Save = Save;
  readonly Building2 = Building2;
  readonly PencilRuler = PencilRuler;

  config: Config = Config.newConfig();

  isEditing: boolean = false;

  constructor() {
    this.service.carregarConfig();
    this.service.config$.subscribe(cfg => {
      if (cfg) this.config = cfg;
    });
  }

  editInfo() {
    if (!this.perm.can('configuracoes', 'edit')) {
      this.toast.show("Sem permissão para editar configurações");
      return;
    }
    this.isEditing = true;
  }

  saveInfo() {
    this.isEditing = false;

    this.service.atualizar(this.config).subscribe({
      next: () => {
        this.toast.show("Atualização de informações da empresa realizada com êxito!");
        this.service.carregarConfig();
      },
      error: err => {
        if (err.status === 403) {
          this.toast.show("Sem permissão para atualizar configurações");
        } else {
          this.toast.show("Erro ao atualizar configurações");
        }
      }
    })
  }
}
