import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Component, inject } from '@angular/core';
import { MainButton } from '../../main-button/main-button';

@Component({
  selector: 'app-aviso-edicao',
  imports: [
    MainButton
  ],
  templateUrl: './aviso-edicao.html',
  styleUrl: './aviso-edicao.scss'
})
export class AvisoEdicao {
  private dialogRef = inject(DialogRef);
  private data = inject(DIALOG_DATA, { optional: true }) as { useCase?: number } | null;
  useCase = this.data?.useCase ?? 0;

  protected confirmar() {
    this.dialogRef?.close(true);
  }

  protected closeModal() {
    this.dialogRef?.close(false);
  }
}
