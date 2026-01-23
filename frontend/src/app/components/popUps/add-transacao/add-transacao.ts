import { DialogRef } from '@angular/cdk/dialog';
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { LucideAngularModule, X } from 'lucide-angular';
import { ToastService } from '../../../services/toast-service';
import { TransacaoService } from '../../../services/transacao-service';
import { Transacao } from './transacao';

@Component({
  selector: 'app-add-transacao',
  imports: [
    CommonModule,
    MatInputModule,
    MatButtonModule,
    FormsModule,
    MatIconModule,
    LucideAngularModule
  ],
  templateUrl: './add-transacao.html',
  styleUrls: ['./add-transacao.scss'],
})
export class AddTransacao {
  transacao: Transacao = Transacao.newTransacao();
  atualizando = false;
  valorDisplay = '0,00';


  private service = inject(TransacaoService);
  private dialogRef = inject(DialogRef<Transacao>);
  private toast = inject(ToastService);
  readonly X = X;

  constructor() {
    if (this.service.transacaoEmEdicao) {
      this.transacao = { ...this.service.transacaoEmEdicao };
      this.transacao.data = new Date(this.transacao.data!).toISOString().split('T')[0] as any;
      this.atualizando = true;
    }

    if (this.atualizando) {
      if (this.transacao.valor != null) {
        this.valorDisplay = this.transacao.valor.toLocaleString('pt-BR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        });
      }
    }
  }

  adicionarTransacao() {
    this.service.salvarBackend(this.transacao).subscribe({
      next: () => {
        this.service.carregarTransacoes();
        this.dialogRef.close();
      },
      error: err => {
        this.toast.show(`Erro ao salvar transação: ${err.error?.erro}`);
      }
    });
  }

  atualizarTransacao() {
    this.service.atualizarBackend(this.transacao).subscribe({
      next: () => {
        this.service.transacaoEmEdicao = undefined;
        this.service.carregarTransacoes();
        this.dialogRef.close();
      },
      error: err => {
        this.toast.show(`Erro ao atualizar a transação: ${err.error?.erro}`);
      }
    })
  }

  protected closeModal() {
    this.dialogRef?.close();
  }

  validateValue(event: Event) {
    let valor = (event.target as HTMLInputElement).value;
    valor = valor.replace(/\D/g, '');

    if (valor === '') {
      this.valorDisplay = '0,00';
      this.transacao.valor = 0;
      return;
    }

    valor = valor.replace(/^0+/, '');

    const centavos = Number(valor);

    const numero = centavos / 100;

    this.transacao.valor = numero;

    this.valorDisplay = numero.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  bloquearNaoNumerico(event: KeyboardEvent) {
    const teclasPermitidas = [
      'Backspace',
      'Delete',
      'ArrowLeft',
      'ArrowRight',
      'Tab'
    ];

    if (teclasPermitidas.includes(event.key)) {
      return;
    }

    if (!/^\d$/.test(event.key)) {
      event.preventDefault();
    }
  }

  moveCursorToEnd(input: HTMLInputElement) {
    requestAnimationFrame(() => {
      const len = input.value.length;
      input.setSelectionRange(len, len);
    });
  }
}
