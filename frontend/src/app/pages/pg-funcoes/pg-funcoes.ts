import { Dialog } from '@angular/cdk/dialog';
import { Component, inject, ViewChild } from '@angular/core';
import { BookUser, CircleAlert, Database, Plus, TriangleAlert } from 'lucide-angular';
import { combineLatestWith, map } from 'rxjs';
import { MainButton } from '../../components/main-button/main-button';
import { AddFuncao } from '../../components/popUps/add-funcao/add-funcao';
import { Funcao } from '../../components/popUps/add-funcao/funcao';
import { SmallCardSection } from '../../components/small-card-section/small-card-section';
import { SmallCard } from '../../components/small-card/small-card';
import { ConsultaFuncao } from '../../components/tabelas/consulta-funcao/consulta-funcao';
import { FuncaoService } from '../../services/funcao-service';
import { MembroService } from '../../services/membro-service';
import { PermissionService } from '../../services/permission-service';


@Component({
  selector: 'app-pg-funcoes',
  imports: [SmallCard, SmallCardSection, MainButton, ConsultaFuncao],
  templateUrl: './pg-funcoes.html',
  styleUrl: './pg-funcoes.scss'
})
export class PgFuncoes {

  private service = inject(FuncaoService);
  private membroService = inject(MembroService);
  private dialog = inject(Dialog);
  perm = inject(PermissionService);

  readonly Plus = Plus;
  readonly Boxes = Database;
  readonly TriangleAlert = TriangleAlert;
  readonly CircleAlert = CircleAlert;
  readonly BookUser = BookUser;

  totalFuncoes: number = 0;
  funcoesInativas: number = 0;
  mediaMembrosFuncao: number = 0;
  funcoesUmMembro: number = 0;
  cardSelecionado: 'total' | 'inativas' | 'em Risco' | null = null;

  @ViewChild(ConsultaFuncao) tabela?: ConsultaFuncao;

  protected openModal() {
    this.service.funcaoEmEdicao = undefined;
    const ref = this.dialog.open(AddFuncao, { disableClose: true });

    ref.closed.subscribe((novaFuncao) => {
      const funcao = novaFuncao as Funcao | undefined;
      if (novaFuncao) {
        this.tabela?.recarregarLista();
      }
    })
  }

  ngOnInit() {
    this.service.funcao$.subscribe((lista) => {
      const listaTotalFuncoes = lista.filter(f => f.isActive !== false);
      this.totalFuncoes = listaTotalFuncoes.length;
    });

    this.service.funcao$.pipe(
      combineLatestWith(this.membroService.membros$),
      map(([funcoes, membros]) => {
        const funcoesAtivas = funcoes.filter(f => f.isActive !== false);
        const membrosAtivos = membros.filter(m => m.isActive !== false);

        let semMembros = 0;
        let umMembro = 0;
        let totalMembros = 0;

        for (const funcao of funcoesAtivas) {
          const count = membros.filter(m => m.funcaoId === funcao.id).length;
          totalMembros += count;
          if (count === 0) semMembros++;
          else if (count === 1) umMembro++;
        }
        const media = funcoesAtivas.length > 0 ? totalMembros / funcoesAtivas.length : 0;

        return { semMembros, umMembro, media };
      })
    ).subscribe(({ semMembros, umMembro, media }) => {
      this.funcoesInativas = semMembros;
      this.funcoesUmMembro = umMembro;
      this.mediaMembrosFuncao = Number(media.toFixed(2));
    })
  }

  filtrarTotal() {
    if (!this.tabela) return;
    this.tabela?.recarregarLista();
    this.cardSelecionado = 'total';
  }
  filtrarInativas() {
    this.tabela?.filtrarPorQuantidade(0, 0);
    this.cardSelecionado = 'inativas';
  }
  filtrarEmRisco() {
    this.tabela?.filtrarPorQuantidade(1, 1);
    this.cardSelecionado = 'em Risco';
  }
}
