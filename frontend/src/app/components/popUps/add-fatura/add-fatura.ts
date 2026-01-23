import { DialogRef } from '@angular/cdk/dialog';
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { LucideAngularModule, X } from 'lucide-angular';
import { FaturaService } from '../../../services/fatura-service';
import { FechamentoService } from '../../../services/fechamento-service';
import { ToastService } from '../../../services/toast-service';
import { Fechamento } from '../../tabelas/add-fechamento/fechamento';
import { Fatura, FormaPagamento } from './fatura';


@Component({
  selector: 'app-add-fatura',
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatInputModule,
    LucideAngularModule
  ],
  templateUrl: './add-fatura.html',
  styleUrls: ['./add-fatura.scss'],
})
export class AddFatura implements OnInit {
  fatura: Fatura = Fatura.newFatura();
  atualizando = false;
  fechamentos: Fechamento[] = [];
  fechamentoSelecionado?: Fechamento;
  quantidadeMembros: number = 0;
  FormaPagamento = FormaPagamento;
  readonly X = X;

  mostrarDetalhes = false;

  private service = inject(FaturaService);
  private ref = inject(DialogRef<Fatura>);
  private fechamentoService = inject(FechamentoService);
  private toast = inject(ToastService);

  ngOnInit() {
    this.fechamentoService.fechamento$.subscribe(lista => {
      this.fechamentos = lista.filter(f => f.isActive !== false);
    });

    if (this.service.faturaEmEdicao) {
      this.fatura = { ...this.service.faturaEmEdicao };
      this.atualizando = true;
    }

    if (this.fatura.fechamentoId) {
      this.selecionarFechamento(this.fatura.fechamentoId);
    }
  }

  selecionarFechamento(idFechamento: string) {
    this.mostrarDetalhes = false;

    if (!idFechamento) {
      this.fechamentoSelecionado = undefined;
      return;
    }

    this.fechamentoService.buscarFechamentoPorIdBackend(idFechamento).subscribe({
      next: (fechamento) => {
        this.fatura.fechamentoId = fechamento.id!;
        this.fechamentoSelecionado = fechamento;
        this.quantidadeMembros = fechamento.membrosFechados.length || 0;
        this.fatura.clienteNome = fechamento.equipe?.cliente?.razaoSocial || fechamento.equipe?.cliente?.nomeFantasia || fechamento.equipe?.cliente?.nomeCompleto;
        this.fatura.valorTotal = fechamento.valorTotal;
        this.mostrarDetalhes = true;
      },
      error: err => {
        this.toast.show(`Erro ao selecionar o fechamento: ${err.error?.erro}`);
      },
    });
  }

  adicionarFatura() {
    this.service.salvarBackend(this.fatura).subscribe({
      next: () => {
        this.ref.close();
        this.service.carregarFaturas();
      },
      error: err => {
        this.toast.show(`Erro ao salvar a fatura: ${err.error?.erro}`);
      }
    });
  }

  atualizarFatura() {
    this.service.atualizarBackend(this.fatura).subscribe({
      next: () => {
        this.service.atualizar(this.fatura);
        this.service.faturaEmEdicao = undefined;
        this.ref.close();
        this.service.carregarFaturas();
      },
      error: err => {
        this.toast.show(`Erro ao atualizar a fatura: ${err.error?.erro}`);
      }
    });
  }

  protected closeModal() {
    this.ref?.close();
  }
}
