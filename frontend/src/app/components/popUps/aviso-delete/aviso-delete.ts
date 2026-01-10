import { Component, inject } from '@angular/core';
import { DialogRef } from '@angular/cdk/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MembroService } from '../../../services/membro-service';

@Component({
  selector: 'app-aviso-delete',
  imports: [
    MatButtonModule
  ],
  templateUrl: './aviso-delete.html',
  styleUrl: './aviso-delete.scss'
})
export class AvisoDelete {
  private dialogRef = inject(DialogRef);
  private serviceMembro = inject(MembroService);
  
  get equipes() {
    return this.serviceMembro.equipesDoMembroEmDelete;
  }

  protected closeModal() {
    this.dialogRef?.close();
  }
}
