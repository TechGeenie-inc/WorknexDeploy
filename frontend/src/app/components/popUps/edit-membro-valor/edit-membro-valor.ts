import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon'; 
import { MatInputModule } from '@angular/material/input';
import { Membro } from '../add-member/membro';
import { MembroService } from '../../../services/membro-service';
import { DetalheMembroFechamento, Fechamento } from '../../tabelas/add-fechamento/fechamento';
import { FechamentoService } from '../../../services/fechamento-service';
import { DialogRef } from '@angular/cdk/dialog';

@Component({
  selector: 'app-edit-membro-valor',
  imports: [
    FormsModule,
    CommonModule,
    MatButtonModule,
    MatInputModule,
    MatIconModule
  ],
  templateUrl: './edit-membro-valor.html',
  styleUrl: './edit-membro-valor.scss'
})
export class EditMembroValor implements OnInit{
  private dialogRef = inject(DialogRef <DetalheMembroFechamento>);

  @Input() membro?: Membro;
  @Input() detalhe?: DetalheMembroFechamento;
  
  precoVendaTemp: number = 0;

  ngOnInit(): void {
    if (this.detalhe) {
      this.precoVendaTemp = this.detalhe.precoVenda ?? this.membro?.precoVenda ?? 0;
    } else if (this.membro) {
      this.precoVendaTemp = this.membro.precoVenda ?? 0;
    }
  }

  salvarAlteracao() {
  if (!this.detalhe) return;

  const detalheAtualizado: DetalheMembroFechamento = {
    ...this.detalhe,
    precoVenda: this.precoVendaTemp,
  };
  this.dialogRef.close(detalheAtualizado);
  }

  closeModal() {
    this.dialogRef.close();
  }
}
