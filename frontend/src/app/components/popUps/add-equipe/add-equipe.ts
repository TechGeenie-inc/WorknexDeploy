import { DialogRef } from '@angular/cdk/dialog';
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { LucideAngularModule, X } from 'lucide-angular';
import { CalendarService } from '../../../services/calendar-service';
import { ClienteService } from '../../../services/cliente-service';
import { EquipeService } from '../../../services/equipe-service';
import { ToastService } from '../../../services/toast-service';
import { ListaMembros } from '../../tabelas/lista-membros/lista-membros';
import { Cliente } from '../add-cliente/cliente';
import { Equipe } from './equipe';

@Component({
  selector: 'app-add-equipe',
  imports: [
    MatButtonModule,
    FormsModule,
    MatInputModule,
    CommonModule,
    ListaMembros,
    LucideAngularModule
  ],
  templateUrl: './add-equipe.html',
  styleUrls: ['./add-equipe.scss',],
})

export class AddEquipe implements OnInit {

  private service = inject(EquipeService);
  private dialogRef = inject(DialogRef<Equipe>);
  private clienteService = inject(ClienteService);
  private calendarService = inject(CalendarService);
  private toast = inject(ToastService);
  private readonly clienteLimite = 50;
  readonly X = X;

  equipe: Equipe = Equipe.newEquipe();
  atualizando = false;
  clientes: Cliente[] = [];
  clienteSelecionado?: Cliente;
  dataInvalida: boolean = false;
  muitosDias: boolean = false;
  nomeMembros: string[] = []
  dataTrigger = 0;

  constructor() {
    if (this.service.equipeEmEdicao) {
      const id = this.service.equipeEmEdicao.id!;

      this.service.buscarEquipePorIdBackend(id).subscribe({
        next: (dados: any) => {
          const equipe = dados as Equipe;

          if (equipe.dataInicio) {
            equipe.dataInicio = new Date(equipe.dataInicio).toISOString().split('T')[0] as any;
          }
          if (equipe.dataFinal) {
            equipe.dataFinal = new Date(equipe.dataFinal).toISOString().split('T')[0] as any;
          }

          equipe.membros = dados.membros || [];
          equipe.membrosIds = Array.isArray(dados.membros)
            ? dados.membros.map((m: any) => m.id)
            : [];

          this.equipe = equipe;
          this.atualizando = true;
        },
        error: (err) => {
          this.toast.show("Erro ao buscar equipe");
        }
      });
    }
  }


  ngOnInit(): void {
    this.clienteService.cliente$.subscribe(lista => {
      this.clientes = lista.filter(c => c.isActive !== false);
    })
  }

  adicionarEquipe() {
    this.equipe.participacaoMembros = this.equipe.membros?.map(m => ({
      membroId: m.id!,
      dataInicio: this.toDateString(m.dataInicioIndividual ?? this.equipe.dataInicio),
      dataFim: this.toDateString(m.dataFimIndividual ?? this.equipe.dataFinal)
    }));

    this.service.salvarBackend(this.equipe).subscribe({
      next: () => {
        this.service.carregarEquipes();
        this.clienteService.carregarClientes();
        this.dialogRef?.close();
      },
      error: err => {
        if ( err.status === 403 ) {
          this.toast.show(`Impossível criar equipe sem membros`);
          return;
        }
        this.toast.show(`Erro ao criar equipe`);
      },
    });
    this.calendarService.criarEventoDaEquipe(this.equipe);
  }

  atualizarEquipe() {
    this.equipe.participacaoMembros = this.equipe.membros?.map(m => ({
      membroId: m.id!,
      dataInicio: this.toDateString(m.dataInicioIndividual ?? this.equipe.dataInicio),
      dataFim: this.toDateString(m.dataFimIndividual ?? this.equipe.dataFinal)
    }));

    this.service.atualizarBackend(this.equipe).subscribe({
      next: () => {
        this.service.equipeEmEdicao = undefined;
        this.service.carregarEquipes();
        this.clienteService.carregarClientes();
        this.dialogRef?.close();
      },
      error: err => {
        this.toast.show("Erro ao atualizar a equipe");
      }
    });
  }

  selecionarCliente(idCliente: string) {
    if (!idCliente) {
      this.clienteSelecionado = undefined;
      return;
    }
    this.equipe.clienteId = idCliente;
    this.clienteSelecionado = this.clienteService.buscarClientePorId(idCliente);
  }

  truncate(texto?: string, limite = this.clienteLimite): string {
    if (!texto) return '';
    if (texto.length <= limite) return texto;
    return `${texto.slice(0, limite).trimEnd()}...`;
  }

  protected closeModal() {
    this.dialogRef?.close();
  }

  verificarData() {
    if (!this.equipe.dataInicio || !this.equipe.dataFinal) {
      return;
    }

    const inicio = new Date(this.equipe.dataInicio);
    const fim = new Date(this.equipe.dataFinal);

    const diffEmMs = fim.getTime() - inicio.getTime();
    const diffEmDias = diffEmMs / (1000 * 60 * 60 * 24);

    if (diffEmDias > 6) {
      this.muitosDias = true;
    }

    if (diffEmDias <= 6) {
      this.muitosDias = false;
    }

    if (inicio > fim) {
      this.dataInvalida = true;
    } else {
      this.dataInvalida = false;
    }

    this.dataTrigger++;
  }

  toDateString(d: string | Date | undefined) {
    if (!d) return '';
    const date = new Date(d);
    return date.toISOString().split('T')[0];
  }

}
