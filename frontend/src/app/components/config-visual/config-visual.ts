import { Dialog } from '@angular/cdk/dialog';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Palette, PencilLine, RotateCcw, Save } from 'lucide-angular';
import { ConfigVisualService } from '../../services/config-visual-service';
import { ToastService } from '../../services/toast-service';
import { MainButton } from '../main-button/main-button';
import { AvisoEdicao } from '../popUps/aviso-edicao/aviso-edicao';
import { Colors } from './colors';


@Component({
  selector: 'app-config-visual',
  imports: [LucideAngularModule, MainButton, FormsModule],
  templateUrl: './config-visual.html',
  styleUrl: './config-visual.scss'
})
export class ConfigVisual implements OnInit {
  readonly Palette = Palette;
  readonly PencilLine = PencilLine;
  readonly Save = Save;
  readonly RotateCcw = RotateCcw
  private dialog = inject(Dialog);

  colors: Colors = new Colors();

  constructor(
    private configVisualService: ConfigVisualService,
    private toast: ToastService
  ) { }

  ngOnInit() {
    this.carregarCores();
  }

  carregarCores() {
    this.configVisualService.getVisualConfig().subscribe({
      next: (data) => {
        // Se vier dados do back, mesclamos com o objeto colors atual
        if (data) {
          Object.assign(this.colors, data);
        }
      },
      error: (err) => console.error("Erro ao carregar cores", err)
    });
  }

  salvarAlteracoes() {
    this.configVisualService.updateVisualConfig(this.colors).subscribe({
      next: (data) => {
        this.toast.show("Visual atualizado com sucesso!");
        this.configVisualService.applyColors(this.colors);
      },
      error: (err) => {
        this.toast.show("Erro ao salvar visual.");
        console.error(err);
      }
    });
  }

  resetarCores() {
    this.colors = new Colors();
    this.salvarAlteracoes();
  }

  openSaveModal() {
    const ref = this.dialog.open(AvisoEdicao, { data: { useCase: 2 } });
    ref.closed.subscribe((confirmado) => {
      if (confirmado) {
        this.salvarAlteracoes();
      }
    })
  }
  openResetModal() {
    const ref = this.dialog.open(AvisoEdicao, { data: { useCase: 6 } });
    ref.closed.subscribe((confirmado) => {
      if (confirmado) {
        this.resetarCores();
      }
    })
  }

}
