import { Component, inject } from '@angular/core';
import { DialogRef } from '@angular/cdk/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MembroService } from '../../../services/membro-service';
import { ClienteService } from '../../../services/cliente-service';
import { EquipeService } from '../../../services/equipe-service';
import { FechamentoService } from '../../../services/fechamento-service';
import { FaturaService } from '../../../services/fatura-service';
import { FuncaoService } from '../../../services/funcao-service';
import { TransacaoService } from '../../../services/transacao-service';
import { AuthService } from '../../../services/auth-service';

@Component({
  selector: 'app-confirma-deletar',
  imports: [
    MatButtonModule
  ],
  templateUrl: './confirma-deletar.html',
  styleUrl: './confirma-deletar.scss'
})
export class ConfirmaDeletar {
  private dialogRef = inject(DialogRef);
  private serviceMembro = inject(MembroService);
  private serviceCliente = inject(ClienteService);
  private serviceEquipe = inject(EquipeService);
  private serviceFechamento = inject(FechamentoService);
  private serviceFuncao = inject(FuncaoService);
  private serviceFatura = inject(FaturaService);
  private serviceTransacao = inject(TransacaoService);
  private authService = inject(AuthService);

  protected get contextoAtual() {
    if (this.serviceMembro.membroEmDelete) return 'a/o membro';
    if (this.serviceEquipe.equipeEmDelete) return 'a equipe';
    if (this.serviceCliente.clienteEmDelete) return 'o cliente';
    if (this.serviceFechamento.fechamentoEmDelete) return 'o fechamento';
    if (this.serviceFuncao.funcaoEmDelete) return 'a função';
    if (this.serviceFatura.faturaEmDelete) return 'a fatura';
    if (this.serviceTransacao.transacaoEmDelete) return 'a transação';
    if (this.authService.usuarioEmDelete) return 'PERMANENTEMENTE o usuário';
    return null;
  }

  protected get nomeEntidade() {
    const m = this.serviceMembro.membroEmDelete;
    const c = this.serviceCliente.clienteEmDelete;
    const e = this.serviceEquipe.equipeEmDelete;
    const f = this.serviceFechamento.fechamentoEmDelete;
    const fa = this.serviceFatura.faturaEmDelete;
    const fu = this.serviceFuncao.funcaoEmDelete;
    const t = this.serviceTransacao.transacaoEmDelete;
    const u = this.authService.usuarioEmDelete;

    if (m) return m.nome || '';
    if (c) return c.razaoSocial || c.nomeCompleto || c.nomeFantasia || '';
    if (e) return e.nomeEquipe || '';
    if (fu) return fu.nomeFuncao || '';
    if (f) return `${f.equipeNome ?? ''} ${f.equipeNome && f.equipeTarefa ? ' - ' : ''} ${f.equipeTarefa ?? ''}`;
    if (fa) return fa.clienteNome || '';
    if (t) return t.desc || '';
    if (u) return u.nome || '';
    return '';
  }


  protected confirmar() {
    const servicos = [
      { ref: this.serviceMembro, key: 'membroEmDelete' },
      { ref: this.serviceCliente, key: 'clienteEmDelete' },
      { ref: this.serviceEquipe, key: 'equipeEmDelete' },
      { ref: this.serviceFuncao, key: 'funcaoEmDelete' },
      { ref: this.serviceFatura, key: 'faturaEmDelete' },
      { ref: this.serviceFechamento, key: 'fechamentoEmDelete' },
      { ref: this.serviceTransacao, key: 'transacaoEmDelete' },
      { ref: this.authService, key: 'usuarioEmDelete' },
    ];

    for (const { ref, key } of servicos) {
      const item = (ref as any)[key];
      if (item) {
        ref.deletar(item);
        (ref as any)[key] = undefined;
      }
    }

    this.closeModal();
  }

  protected closeModal() {
    this.serviceTransacao.transacaoEmDelete = undefined;
    this.serviceFechamento.fechamentoEmDelete = undefined;
    this.serviceFatura.faturaEmDelete = undefined;
    this.serviceFuncao.funcaoEmDelete = undefined;
    this.serviceEquipe.equipeEmDelete = undefined;
    this.serviceCliente.clienteEmDelete = undefined;
    this.serviceMembro.membroEmDelete = undefined;
    this.authService.usuarioEmDelete = undefined;
    this.dialogRef?.close();
  }
}
