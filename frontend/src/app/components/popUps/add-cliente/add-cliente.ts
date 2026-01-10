import { DialogRef } from '@angular/cdk/dialog';
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { cnpj, cpf } from 'cpf-cnpj-validator';
import { Building2, FileText, IdCard, List, LucideAngularModule, Mail, MapPin, Phone, User, X } from 'lucide-angular';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { ClienteService } from '../../../services/cliente-service';
import { ToastService } from '../../../services/toast-service';
import { Cliente } from './cliente';

@Component({
  selector: 'app-add-cliente',
  imports: [
    FormsModule,
    MatButtonModule,
    MatInputModule,
    CommonModule,
    MatIconModule,
    LucideAngularModule,
    NgxMaskDirective
  ],
  providers: [
    provideNgxMask(),
  ],
  templateUrl: './add-cliente.html',
  styleUrls: ['./add-cliente.scss'],
})

export class AddCliente {
  readonly IdCard = IdCard;
  readonly MapPin = MapPin;
  readonly FileText = FileText;
  readonly List = List;
  readonly User = User;
  readonly Biulding2 = Building2;
  readonly Mail = Mail;
  readonly Phone = Phone;
  readonly X = X;


  cliente: Cliente = Cliente.newCliente();
  atualizando = false;

  private service = inject(ClienteService);
  private dialogRef = inject(DialogRef<Cliente>);
  private toast = inject(ToastService);

  constructor() {
    if (this.service.clienteEmEdicao) {
      this.cliente = { ...this.service.clienteEmEdicao };
      this.atualizando = true;
    }
  }

  adicionarCliente() {

    if (this.cliente.tipoCliente === 'CPF') {
      if (!cpf.isValid(this.cliente.cpf!)) {
        alert("CPF inválido!");
        return;
      }
    }

    if (this.cliente.tipoCliente === 'CNPJ') {
      if (!cnpj.isValid(this.cliente.cnpj!)) {
        alert("CNPJ inválido!")
        return;
      }
    }

    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.cliente.email!);

    if (!emailValido) {
      alert("Email inválido");
      return;
    }

    this.service.salvarBackend(this.cliente).subscribe({
      next: () => {
        this.service.carregarClientes();
        this.dialogRef?.close();
      },
      error: (err) => {
        this.toast.show("Erro ao salvar cliente");
      }
    });
  }

  atualizarCliente() {
    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.cliente.email!);

    if (!emailValido) {
      alert("Email inválido");
      return;
    }

    if (this.cliente.tipoCliente === 'CPF') {
      if (!cpf.isValid(this.cliente.cpf!)) {
        alert("CPF inválido!");
        return;
      }
    }

    if (this.cliente.tipoCliente === 'CNPJ') {
      if (!cnpj.isValid(this.cliente.cnpj!)) {
        alert("CNPJ inválido!")
        return;
      }
    }

    this.service.atualizarBackend(this.cliente).subscribe({
      next: () => {
        this.service.clienteEmEdicao = undefined;
        this.dialogRef?.close();
      },
      error: (err) => {
        this.toast.show("Erro ao atualizar cliente");
      }
    });
  }

  protected closeModal() {
    this.dialogRef?.close();
  }

  onTipoClienteChange(tipo: 'CPF' | 'CNPJ') {
    this.cliente.tipoCliente = tipo;

    if (tipo === 'CPF') {
      this.cliente.razaoSocial = '';
      this.cliente.nomeFantasia = '';
      this.cliente.inscricaoEstadual = '';
      this.cliente.cnpj = '';
    } else if (tipo === 'CNPJ') {
      this.cliente.nomeCompleto = '';
      this.cliente.cpf = '';
    }
  }

  onCepChange(valor: string) {
    const cepLimpo = valor.replace(/\D/g, '');

    if (cepLimpo.length === 8) {
      this.buscarCep(cepLimpo);
    }
  }

  buscarCep(cep: string) {
    fetch(`https://viacep.com.br/ws/${cep}/json/`)
      .then(res => res.json())
      .then(dados => {
        if (dados.erro) {
          alert("CEP não encontrado!");
          return;
        }

        this.cliente.cidade = dados.localidade;
        this.cliente.estado = dados.uf;
        this.cliente.enderecoCompleto = `${dados.logradouro}, ${this.cliente.cidade}, ${this.cliente.estado}`;
      });
  }

}
