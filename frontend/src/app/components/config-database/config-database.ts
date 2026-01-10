import { Component, inject, ViewChild, ElementRef } from '@angular/core';
import { Database, Download, LucideAngularModule, Trash2, Upload, Eraser } from 'lucide-angular';
import { MainButton } from '../main-button/main-button';
import { SistemaService } from '../../services/sistema-service';
import { ToastService } from '../../services/toast-service';

@Component({
  selector: 'app-config-database',
  imports: [
    LucideAngularModule,
    MainButton,
  ],
  templateUrl: './config-database.html',
  styleUrl: './config-database.scss'
})
export class ConfigDatabase {
  private service = inject(SistemaService);
  private toast = inject(ToastService);

  readonly Database = Database;
  readonly Download = Download;
  readonly Upload = Upload;
  readonly Trash2 = Trash2;
  readonly Eraser = Eraser;

  disabledButton = true;

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  abrirInputArquivo() {
    this.fileInput.nativeElement.click();
  }

  onArquivoSelecionado(event: any) {
    const arquivo = event.target.files[0];
    if (!arquivo) return;

    this.service.importarDados(arquivo).subscribe({
      next: () => {
        this.toast.show("Dados importados com sucesso! Recarregando página...");
        setTimeout(() => {
          window.location.reload();
        }, 3000);
      },
      error: err => {
        if (err.status === 403) {
          this.toast.show("Sem permissão para realizar a importação de dados");
        } else {
          this.toast.show("Erro ao importar dados");
        }
      }
    })
  }

  exportarDados() {
    this.service.exportarDados().subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "backup.json";
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: err => {
        if (err.status === 403) {
          this.toast.show("Sem permissão para realizar a exportação de dados");
        } else {
          this.toast.show("Erro ao exportar dados");
        }
      }
    })
  }

  limparDados() {
    this.service.excluirDados().subscribe({
      next: () => {
        this.toast.show("Dados limpos com sucesso, recarregando página...");
        setTimeout(() => {
          window.location.reload();
        }, 3000);
      },
      error: err => {
        if (err.status === 403) {
          this.toast.show("Sem permissão para realizar a limpeza de dados");
        } else {
          this.toast.show("Erro ao limpar dados");
        }
      }
    })
  }

  confirm() {
    this.disabledButton = false;
    this.toast.show("Se for apagar os dados, aperte novamente no mesmo botão. Se não fizer nada, após 5 segundos o botão voltará ao estado normal.");

    setTimeout(() => {
      this.disabledButton = true;
    }, 5000);
  }

}