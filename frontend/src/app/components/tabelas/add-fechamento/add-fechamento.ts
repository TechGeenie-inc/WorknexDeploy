import { Dialog } from '@angular/cdk/dialog';
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { LucideAngularModule, SquarePen } from 'lucide-angular';
import { EquipeService } from '../../../services/equipe-service';
import { FechamentoService } from '../../../services/fechamento-service';
import { FuncaoService } from '../../../services/funcao-service';
import { ToastService } from '../../../services/toast-service';
import { MainButton } from '../../main-button/main-button';
import { Equipe } from '../../popUps/add-equipe/equipe';
import { Membro } from '../../popUps/add-member/membro';
import { EditMembroValor } from '../../popUps/edit-membro-valor/edit-membro-valor';
import { DetalheMembroFechamento, Fechamento } from './fechamento';


@Component({
  selector: 'app-add-fechamento',
  imports: [
    FormsModule,
    MatButtonModule,
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatTableModule,
    MainButton,
    LucideAngularModule
  ],
  templateUrl: './add-fechamento.html',
  styleUrl: './add-fechamento.scss'
})
export class AddFechamento implements OnInit {

  readonly SquarePen = SquarePen;

  private service = inject(FechamentoService);
  private equipeService = inject(EquipeService);
  private funcaoService = inject(FuncaoService);
  private dialog = inject(Dialog);
  private toast = inject(ToastService);
  private readonly equipeLimite = 60;
  private readonly membroLimite = 40;

  equipes: Equipe[] = [];
  fechamento: Fechamento = Fechamento.newFechamento();
  atualizando: boolean = false;
  equipeSelecionada?: Equipe;
  membrosDaEquipe: Membro[] = [];

  ngOnInit(): void {
    this.equipeService.equipe$.subscribe(lista => {
      this.equipes = lista.filter(e => e.isActive !== false);
    })
  }

  getDetalheMembro(m: Membro): DetalheMembroFechamento {
    let detalhe = this.fechamento.detalhesMembros.find(d => d.membroId === m.id);
    let membroFuncao = this.funcaoService.buscarFuncaoPorId(m.funcaoId!)?.nomeFuncao || 'Função não cadastrada';
    if (!detalhe) {
      detalhe = { membroId: m.id!, membroNome: m.nome!, membroFuncao: membroFuncao!, precoVenda: m.precoVenda, horasTrabalhadas: 0, horasExtras: 0, diarias: 0, valorTotal: 0, adicional: 0 };
      this.fechamento.detalhesMembros.push(detalhe);
    }
    return detalhe;
  }

  selecionarEquipe(idEquipe: string) {
    if (!idEquipe) {
      this.equipeSelecionada = undefined;
      this.membrosDaEquipe = [];
      this.fechamento.detalhesMembros = [];
      this.fechamento.idEquipe = '';
      return;
    }
    this.equipeService.buscarEquipePorIdBackend(idEquipe).subscribe({
      next: (equipe) => {
        this.equipeSelecionada = equipe;
        this.fechamento.idEquipe = equipe.id!;
        this.fechamento.equipeNome = equipe.nomeEquipe;
        this.fechamento.equipeTarefa = equipe.tarefa;
        this.fechamento.equipeDataInicio = equipe.dataInicio;
        this.fechamento.equipeDataFinal = equipe.dataFinal;

        const cliente = equipe.cliente;
        this.fechamento.equipeCliente =
          (cliente?.razaoSocial || cliente?.nomeFantasia || cliente?.nomeCompleto) ?? "Sem nomeação";

        this.membrosDaEquipe = equipe.membros || [];

        this.fechamento.detalhesMembros = this.membrosDaEquipe.map(m => {
          const membroFuncao = m.funcao?.nomeFuncao || 'Função não cadastrada';
          return {
            membroId: m.id!,
            membroNome: m.nome!,
            membroFuncao,
            precoVenda: m.precoVenda,
            horasTrabalhadas: 0,
            horasExtras: 0,
            diarias: 0,
            valorTotal: 0,
            adicional: 0
          };
        });
        this.atualizarValorTotalFechamento();
      },
      error: (err) => {
        this.toast.show("Erro ao buscar a equipe selecionada");
      }
    });
  }


  salvar(form: NgForm) {
    if (!form.valid) return;
    this.fechamento.detalhesMembros.forEach(d => {
      const membro = this.membrosDaEquipe.find(m => m.id === d.membroId);

      const precoVenda = Number(d.precoVenda ?? membro?.precoVenda ?? 0) || 0;
      const horasTotais = Number(d.horasTrabalhadas || 0) + Number(d.horasExtras || 0);
      const adicional = Number(d.adicional || 0);
      d.precoVenda = precoVenda;
      d.valorTotal = (horasTotais * precoVenda) + adicional;
      d.horasTrabalhadas = Number(d.horasTrabalhadas || 0);
      d.horasExtras = Number(d.horasExtras || 0);
      d.diarias = Number(d.diarias || 0);
      d.adicional = Number(d.adicional || 0);
    });

    this.fechamento.horasTotais = this.fechamento.detalhesMembros
      .reduce((acc, d) => acc + (Number(d.horasTrabalhadas || 0) + Number(d.horasExtras || 0) + Number(d.diarias || 0)), 0);

    this.fechamento.qtdMembros = this.fechamento.detalhesMembros.length;
    this.fechamento.valorTotal = this.fechamento.detalhesMembros
      .reduce((acc, d) => acc + (Number(d.valorTotal || 0)), 0);

    const payload: any = {
      id: this.fechamento.id,
      idEquipe: this.fechamento.idEquipe,
      horasTotais: this.fechamento.horasTotais ?? 0,
      obs: this.fechamento.obs ?? null,
      valorTotal: this.fechamento.valorTotal ?? 0,
      status: this.fechamento.status ?? false,
      detalhesMembros: this.fechamento.detalhesMembros.map(d => ({
        membroId: d.membroId,
        horasTrabalhadas: d.horasTrabalhadas ?? 0,
        horasExtras: d.horasExtras ?? 0,
        diarias: d.diarias ?? 0,
        adicional: d.adicional ?? 0,
        precoVenda: d.precoVenda ?? 0,
        valorTotal: d.valorTotal ?? 0
      }))
    };

    this.service.salvarBackend(payload).subscribe({
      next: () => {
        this.fechamento = Fechamento.newFechamento();
        this.equipeSelecionada = undefined;
        this.membrosDaEquipe = [];
        form.resetForm({
          idEquipe: ''
        });
        this.service.carregarFechamentos();
      },
      error: err => {
        this.toast.show("Erro ao salvar fechamento");
      }
    });
  }


  onChangeEquipe(idEquipe: string) {
    this.selecionarEquipe(idEquipe);
  }

  calcularValorMembro(m: Membro): number {
    const detalhe = this.getDetalheMembro(m);
    const precoVenda = Number(detalhe.precoVenda ?? m.precoVenda) || 0;
    const horasTotais = Number(detalhe.horasTrabalhadas) + Number(detalhe.horasExtras);
    const adicional = + Number(detalhe.adicional);
    return (horasTotais * precoVenda) + adicional;
  }

  calcularValorTotal(): number {
    return this.membrosDaEquipe.reduce((acc, membro) => acc + this.calcularValorMembro(membro), 0);
  }

  atualizarValorTotalMembro(m: Membro) {
    const detalhe = this.getDetalheMembro(m);

    const precoVenda = Number(detalhe.precoVenda ?? m.precoVenda) || 0;
    const horasTotais = Number(detalhe.horasTrabalhadas) + Number(detalhe.horasExtras);
    const adicional = Number(detalhe.adicional) || 0;

    detalhe.valorTotal = (horasTotais * precoVenda) + adicional;
    this.atualizarValorTotalFechamento();
  }


  atualizarValorTotalFechamento() {
    this.fechamento.valorTotal = this.fechamento.detalhesMembros
      .reduce((acc, d) => acc + (d.valorTotal || 0), 0);

    this.fechamento.qtdMembros = this.fechamento.detalhesMembros.length;
    this.fechamento.horasTotais = this.horasTotaisEquipe;
  }

  get horasTotaisEquipe(): number {
    return this.fechamento.detalhesMembros
      .reduce((total, detalhe) =>
        total + (Number(detalhe.horasTrabalhadas)
          + Number(detalhe.horasExtras)), 0);
  }

  editarValor(membro: Membro) {
    const detalhe = this.getDetalheMembro(membro);

    const ref = this.dialog.open(EditMembroValor, { disableClose: true });
    const instance = ref.componentInstance;
    instance!.membro = membro;
    instance!.detalhe = detalhe;

    ref.closed.subscribe((resultado) => {
      const r = resultado as DetalheMembroFechamento | undefined;
      if (r) {
        Object.assign(detalhe, r);
        this.atualizarValorTotalMembro(membro);
      }
    });
  }

  formatarData(date: string | Date | null): string {
    if (!date) return '';
    return new Date(date).toISOString().split('T')[0];
  }

  formatEquipeLabel(eq: Equipe): string {
    const texto = `${eq.nomeEquipe ?? 'Sem equipe'} — ${eq.tarefa ?? 'Sem tarefa'}`;
    return this.truncate(texto, this.equipeLimite);
  }

  truncateMembro(texto?: string): string {
    return this.truncate(texto, this.membroLimite);
  }

  private truncate(texto?: string, limite?: number): string {
    if (!texto) return '';
    if (!limite || texto.length <= limite) return texto;
    return `${texto.slice(0, limite).trimEnd()}...`;
  }

}
