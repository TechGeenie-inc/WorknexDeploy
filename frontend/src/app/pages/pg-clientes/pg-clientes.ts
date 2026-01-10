import { Dialog } from '@angular/cdk/dialog';
import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Building2, CircleCheckBig, FolderClock, LucideAngularModule, Plus, Users } from 'lucide-angular';
import { MainButton } from "../../components/main-button/main-button";
import { AddCliente } from '../../components/popUps/add-cliente/add-cliente';
import { Cliente } from '../../components/popUps/add-cliente/cliente';
import { SmallCardSection } from "../../components/small-card-section/small-card-section";
import { SmallCard } from '../../components/small-card/small-card';
import { ConsultaCliente } from '../../components/tabelas/consulta-cliente/consulta-cliente';
import { ClienteService } from '../../services/cliente-service';
import { EquipeService } from '../../services/equipe-service';
import { Status } from '../../components/popUps/add-equipe/equipe';
import { PermissionService } from '../../services/permission-service';
@Component({
  selector: 'app-pg-clientes',
  imports: [
    SmallCard,
    ConsultaCliente,
    MatButtonModule,
    SmallCardSection,
    LucideAngularModule,
    MainButton
  ],
  templateUrl: './pg-clientes.html',
  styleUrls: ['./pg-clientes.scss'],
})
export class PgClientes implements OnInit {
  private dialog = inject(Dialog);
  private service = inject(ClienteService);
  private equipeService = inject(EquipeService);
  perm = inject(PermissionService);
  
  readonly Plus = Plus;
  readonly Building2 = Building2;
  readonly Users = Users;
  readonly FolderClock = FolderClock;
  readonly CircleCheckBig = CircleCheckBig;

  totalClientes: number = 0;
  clientesAtivos: number = 0;
  projetosAtivos: number = 0;
  projetosConcluidos: number = 0;
  cardSelecionado: 'total' | 'ativos' | null = null;

  @ViewChild(ConsultaCliente) private tabela?: ConsultaCliente;

  protected openModal() {
    this.service.clienteEmEdicao = undefined;
    const ref = this.dialog.open(AddCliente, { disableClose: true });

    ref.closed.subscribe((novoCliente) => {
      const cliente = novoCliente as Cliente | undefined;
      if (novoCliente) {
        this.tabela?.recarregarLista();
      }
    });
  }

  ngOnInit() {
    this.service.cliente$.subscribe((lista) => {
      const listaTotalClientes = lista.filter(c => c.isActive !== false);
      this.totalClientes = listaTotalClientes.length;
      const listaClientesAtivos = lista.filter(c => c.isActive !== false && c.projetosAtivos > 0)
      this.clientesAtivos = listaClientesAtivos.length;
    })
    this.equipeService.equipe$.subscribe((lista) => {
      const listaEquipesAtivas = lista.filter(e => e.isActive !== false && e.status == Status.EmAndamento);
      this.projetosAtivos = listaEquipesAtivas.length;
      const listaEquipesConcluidas = lista.filter(e => e.isActive !== false && e.status == Status.Concluido);
      this.projetosConcluidos = listaEquipesConcluidas.length;
    })
  }

  filtrarTotal() {
    if (!this.tabela) return;
    this.tabela?.recarregarLista();
    this.cardSelecionado = 'total';
  }

  filtrarAtivos() {
    this.tabela?.listarAtivos();
    this.cardSelecionado = 'ativos';
  }
}
