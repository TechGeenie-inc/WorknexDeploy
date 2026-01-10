import { Component, inject, OnInit } from '@angular/core';
import { DialogRef } from '@angular/cdk/dialog';
import { CommonModule } from '@angular/common';
import { Membro } from '../../../popUps/add-member/membro';
import { FechamentoService } from '../../../../services/fechamento-service';
import { MatButtonModule } from '@angular/material/button';
import { Fechamento } from '../../add-fechamento/fechamento';
import { MatTableModule } from '@angular/material/table';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-detalhes-membros',
  imports: [
    MatButtonModule,
    CommonModule,
    MatTableModule,
    FormsModule
  ],
  templateUrl: './detalhes-membros.html',
  styleUrl: './detalhes-membros.scss'
})
export class DetalhesMembros implements OnInit {

  columnsTable: string[] = ["projeto", "cliente", "periodo", "membros", "valorTotal", "status", "acoes"];
  membrosDaEquipe: Membro[] = [];
  fechamento?: Fechamento;
  private serviceFechamento = inject(FechamentoService);
  private dialogRef = inject(DialogRef<Fechamento>);

  ngOnInit(): void {
    const selecionado = this.serviceFechamento.fechamentoSelecionado;
    if (!selecionado) {
      this.dialogRef.close();
      return;
    }
    this.fechamento = selecionado;
    if (!this.fechamento.detalhesMembros) {
      this.fechamento.detalhesMembros = [];
    }
  }

  protected closeModal() {
    this.dialogRef?.close();
  }
}
