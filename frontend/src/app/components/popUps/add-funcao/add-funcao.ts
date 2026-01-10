import { DialogRef } from '@angular/cdk/dialog';
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { LucideAngularModule, X } from 'lucide-angular';
import { FuncaoService } from '../../../services/funcao-service';
import { MembroService } from '../../../services/membro-service';
import { ToastService } from '../../../services/toast-service';
import { Funcao } from './funcao';

@Component({
  selector: 'app-add-funcao',
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatInputModule,
    LucideAngularModule
  ],
  templateUrl: './add-funcao.html',
  styleUrl: './add-funcao.scss'
})
export class AddFuncao {
  funcao: Funcao = Funcao.newFuncao();
  atualizando = false;

  private service = inject(FuncaoService);
  private dialogRef = inject(DialogRef<Funcao>);
  private serviceMembro = inject(MembroService);
  private toast = inject(ToastService);
  readonly X = X;

  constructor() {
    if (this.service.funcaoEmEdicao) {
      this.funcao = { ...this.service.funcaoEmEdicao };
      this.atualizando = true;
    }
  }

  adicionarFuncao() {
    this.service.salvarBackend(this.funcao).subscribe({
      next: () => {
        this.service.carregarFuncoes();
        this.dialogRef?.close();
      },
      error: err => {
        this.toast.show("Erro ao adicionar função");
      }
    });
  }

  atualizarFuncao() {
    this.service.atualizarBackend(this.funcao).subscribe({
      next: () => {
        this.service.funcaoEmEdicao = undefined;
        this.dialogRef?.close();
        this.service.carregarFuncoes();
        this.serviceMembro.carregarMembros();
      },
      error: err => {
        this.toast.show("Erro ao atualizar função");
      }
    });
  }

  protected closeModal() {
    this.dialogRef?.close();
  }
}
