import { DialogRef } from '@angular/cdk/dialog';
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { cpf } from 'cpf-cnpj-validator';
import { LucideAngularModule, X } from 'lucide-angular';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { FuncaoService } from '../../../services/funcao-service';
import { MembroService } from '../../../services/membro-service';
import { ToastService } from '../../../services/toast-service';
import { Funcao } from '../add-funcao/funcao';
import { Membro, TipoPagamento } from './membro';

@Component({
  selector: 'app-add-member',
  imports: [
    FormsModule,
    CommonModule,
    MatInputModule,
    MatButtonModule,
    NgxMaskDirective,
    LucideAngularModule
  ],
  providers: [
    provideNgxMask()
  ],
  templateUrl: './add-member.html',
  styleUrl: './add-member.scss',
})

export class AddMember implements OnInit {
  private service = inject(MembroService);
  private serviceFuncao = inject(FuncaoService);
  private dialogRef = inject(DialogRef<Membro>);
  private toast = inject(ToastService);
  readonly X = X;

  TipoPagamento = TipoPagamento;
  membro: Membro = Membro.newMembro();
  atualizando = false;
  listaFuncoes: Funcao[] = [];
  precoHoraDisplay = '0,00';
  precoVendaDisplay = '0,00';

  constructor() {
    if (this.service.membroEmEdicao) {
      this.membro = { ...this.service.membroEmEdicao };
      this.atualizando = true;
    }
  }

  ngOnInit() {
    this.serviceFuncao.funcao$.subscribe(lista => {
      this.listaFuncoes = lista.filter(f => f.isActive !== false);
    });

    if (this.atualizando) {
      if (this.membro.precoHora != null) {
        this.precoHoraDisplay = this.membro.precoHora.toLocaleString('pt-BR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        });
      }

      if (this.membro.precoVenda != null) {
        this.precoVendaDisplay = this.membro.precoVenda.toLocaleString('pt-BR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        });
      }
    }
  }

  onSelecionarFuncao(id: string) {
    const funcao = this.listaFuncoes.find(f => f.id === id);
    if (funcao) {
      this.membro.funcaoId = funcao.id;
    }
  }

  adicionarMembro() {
    if (!cpf.isValid(this.membro.cpf!)) {
      alert("CPF inválido");
      return;
    }

    this.service.salvarBackend(this.membro).subscribe({
      next: () => {
        this.service.carregarMembros();
        this.dialogRef?.close();
      },
      error: (err) => {
        if (err.status === 404) {
          this.toast.show("Erro ao salvar membro, por favor preencha a função");
          return;
        }
        this.toast.show("Erro ao salvar membro");
      }
    });
  }

  atualizarMembro() {
    this.service.atualizarBackend(this.membro).subscribe({
      next: () => {
        this.service.membroEmEdicao = undefined;
        this.dialogRef?.close();
        this.service.carregarMembros();
      },
      error: (err) => {
        this.toast.show("Erro ao atualizar membro");
      }
    });
  }

  protected closeModal() {
    this.dialogRef?.close();
  }

  onTipoPagamentoChange(tipo: TipoPagamento) {
    this.membro.tipoPagamento = tipo;
  }

  validateHourValue(event: Event) {
    let valor = (event.target as HTMLInputElement).value;

    valor = valor.replace(/\D/g, '');

    if (valor === '') {
      this.precoHoraDisplay = '0,00';
      this.membro.precoHora = 0;
      return;
    }

    valor = valor.replace(/^0+/, '');

    const centavos = Number(valor);

    const numero = centavos / 100;

    this.membro.precoHora = numero;

    this.precoHoraDisplay = numero.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  validateSellValue(event: Event) {
    let valor = (event.target as HTMLInputElement).value;
    valor = valor.replace(/\D/g, '');

    if (valor === '') {
      this.precoVendaDisplay = '0,00';
      this.membro.precoVenda = 0;
      return;
    }

    valor = valor.replace(/^0+/, '');

    const centavos = Number(valor);

    const numero = centavos / 100;

    this.membro.precoVenda = numero;

    this.precoVendaDisplay = numero.toLocaleString('pt-BR', {
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
