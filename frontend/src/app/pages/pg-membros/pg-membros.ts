import { Dialog } from '@angular/cdk/dialog';
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Clock, DollarSign, HandCoins, Plus, User } from 'lucide-angular';
import { MainButton } from '../../components/main-button/main-button';
import { AddMember } from '../../components/popUps/add-member/add-member';
import { Membro } from '../../components/popUps/add-member/membro';
import { SmallCardSection } from '../../components/small-card-section/small-card-section';
import { SmallCard } from '../../components/small-card/small-card';
import { ConsultaMembro } from '../../components/tabelas/consulta-membro/consulta-membro';
import { MembroService } from '../../services/membro-service';
import { PermissionService } from '../../services/permission-service';

@Component({
  selector: 'app-pg-membros',

  imports: [
    SmallCard,
    ConsultaMembro,
    MatButtonModule,
    MainButton,
    CommonModule,
    SmallCardSection
  ],
  templateUrl: './pg-membros.html',
  styleUrls: ['./pg-membros.scss'],
})
export class PgMembros implements OnInit {
  totalMembros: number = 0;
  precoTotalHoras: number = 0;
  mediaPrecoHora: number = 0;
  horasPotenciais: number = 0;  /*Para usar no card das Horas Potenciais WIP*/
  receitaPotencial: number = 0; /*Para usar no card de Receita Potencial WIP*/

  private dialog = inject(Dialog);
  private service = inject(MembroService);
  perm = inject(PermissionService);

  readonly Plus = Plus;
  readonly User = User;
  readonly DollarSign = DollarSign;
  readonly Clock = Clock;
  readonly HandCoins = HandCoins;

  @ViewChild(ConsultaMembro) private tabela?: ConsultaMembro;

  protected openModal() {
    this.service.membroEmEdicao = undefined;
    const ref = this.dialog.open(AddMember, { disableClose: true });

    ref.closed.subscribe((novoMembro) => {
      const membro = novoMembro as Membro | undefined;
      if (novoMembro) {
        this.tabela?.recarregarLista();
      }
    })
  }

  ngOnInit(): void {
    this.service.membros$.subscribe((lista: Membro[]) => {
      const listaFiltrada = lista.filter(m => m.isActive !== false);
      this.totalMembros = listaFiltrada.length;
      this.precoTotalHoras = listaFiltrada.reduce((acc, m) => acc + (m.precoVenda || 0), 0);
      this.mediaPrecoHora = listaFiltrada.length > 0 ? this.precoTotalHoras / listaFiltrada.length : 0;
      this.mediaPrecoHora = parseFloat(this.mediaPrecoHora.toFixed(2));
      this.horasPotenciais = this.totalMembros * 160;
      this.receitaPotencial = this.horasPotenciais * this.mediaPrecoHora;
      this.receitaPotencial = parseFloat(this.receitaPotencial.toFixed(2));
    })
  }

}
