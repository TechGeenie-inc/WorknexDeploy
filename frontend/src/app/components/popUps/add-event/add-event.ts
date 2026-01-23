import { DialogRef } from '@angular/cdk/dialog';
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { LucideAngularModule, X } from 'lucide-angular';
import { CalendarService } from '../../../services/calendar-service';
import { ToastService } from '../../../services/toast-service';
import { Evento } from './evento';

@Component({
  selector: 'app-add-event',
  imports: [
    CommonModule,
    MatButtonModule,
    MatInputModule,
    FormsModule,
    LucideAngularModule
  ],
  templateUrl: './add-event.html',
  styleUrl: './add-event.scss'
})
export class AddEvent {
  private service = inject(CalendarService);
  private dialogRef = inject(DialogRef<Evento>);
  private toast = inject(ToastService);
  readonly X = X;

  evento: Evento = Evento.newEvento();
  atualizando = false;
  startString: string | undefined;
  endString: string | undefined;
  dataInvalida: boolean = false;


  constructor() {
    if (this.service.eventoEmEdicao) {
      this.evento = { ...this.service.eventoEmEdicao };
      this.startString = this.evento.start ? this.formatDate(this.evento.start) : undefined;
      this.endString = this.evento.end ? this.formatDate(this.evento.end) : undefined;
      this.atualizando = true;
    }
  }

  private formatDate(date: Date): string {
    const d = new Date(date);
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${d.getFullYear()}-${month}-${day}`;
  }

  adicionarEvento() {
    this.verificarDatas();
    if (this.dataInvalida) {
      window.alert("A data está inválida");
      return;
    }
    if (this.startString) this.evento.start = this.corrigirFuso(this.startString);
    if (this.endString) this.evento.end = this.corrigirFuso(this.endString);
    this.evento.color = this.service.randomColor();

    this.service.salvarBackend(this.evento).subscribe({
      next: () => {
        this.service.carregarEventos();
        this.dialogRef?.close();
      },
      error: err => {
        this.toast.show(`Erro ao salvar evento: ${err.error?.erro}`);
      }
    });
  }

  atualizarEvento() {
    if (this.startString) this.evento.start = this.corrigirFuso(this.startString);
    if (this.endString) this.evento.end = this.corrigirFuso(this.endString);

    this.service.atualizarBackend(this.evento).subscribe({
      next: () => {
        this.service.eventoEmEdicao = undefined;
        this.service.carregarEventos();
        this.dialogRef?.close();
      },
      error: err => {
        this.toast.show(`Erro ao atualizar evento: ${err.error?.erro}`);
      }
    })
  }

  deletar() {
    this.service.deletar(this.evento);
    this.service.eventoEmEdicao = undefined;
    this.dialogRef.close(this.evento);
  }

  protected closeModal() {
    this.dialogRef?.close();
  }

  private corrigirFuso(data: string): Date {
    if (!data) return new Date();
    const d = new Date(data);
    d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
    return d;
  }

  verificarDatas() {
    if (!this.startString || !this.endString) {
      this.dataInvalida = false;
      return;
    }

    const dataInicio = new Date(this.startString);
    const dataFim = new Date(this.endString);

    if (dataInicio > dataFim) {
      this.dataInvalida = true;
    } else {
      this.dataInvalida = false;
    }
  }
}
