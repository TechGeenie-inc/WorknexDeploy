import { Component, Inject } from '@angular/core';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
@Component({
  selector: 'app-listagem-membro-equipe',
  imports: [
    MatButtonModule,
    CommonModule
  ],
  templateUrl: './listagem-membro-equipe.html',
  styleUrl: './listagem-membro-equipe.scss'
})
export class ListagemMembroEquipe {
  equipe: any;

  constructor(private dialogRef: DialogRef, @Inject(DIALOG_DATA) public data: any) {
    this.equipe = data;
  }

  protected closeModal() {
    this.dialogRef?.close();
  }
}
