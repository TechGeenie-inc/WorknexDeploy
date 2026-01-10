import { Component, Input, Output, EventEmitter, inject, OnInit } from '@angular/core';
import { Membro } from '../../popUps/add-member/membro';
import { FuncaoService } from '../../../services/funcao-service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EquipeService } from '../../../services/equipe-service';
import { Equipe } from '../../popUps/add-equipe/equipe';

@Component({
  selector: 'app-mostra-membro',
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './mostra-membro.html',
  styleUrls: ['./mostra-membro.scss'],
})
export class MostraMembro implements OnInit {
  private serviceFuncao = inject(FuncaoService);
  private serviceEquipe = inject(EquipeService);
  dataDiferente: boolean = false;
  equipe: Equipe = Equipe.newEquipe();

  @Input() membro!: Membro;
  @Input() selected: boolean = false;
  @Input() ocupado: boolean = false;
  @Input() dataInicioEquipe!: string;
  @Input() dataFimEquipe!: string;

  nomeFuncao = '';

  @Output() selectedChange = new EventEmitter<{ id: string; selected: boolean }>();
  @Output() dataChange = new EventEmitter<{ membroId: string; dataInicio?: string; dataFim?: string }>();

  ngOnInit() {
    if (this.membro.funcaoId) {
      this.serviceFuncao.buscarFuncaoPorIdBackend(this.membro.funcaoId).subscribe({
        next: (funcao) => {
          this.nomeFuncao = funcao.nomeFuncao ?? 'Funcao nao cadastrada'
        },
        error: (err) => {
          this.nomeFuncao = "Erro";
        }
      });
    }
  }

  get initials(): string {
    const n = this.membro?.nome ?? '';
    return n.split(' ').map(s => s[0]).slice(0, 2).join('').toUpperCase() || '--';
  }

  onToggle(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    this.selectedChange.emit({ id: this.membro.id!, selected: checked });
  }

  onDataInicioChange(value: string) {
    this.membro.dataInicioIndividual = value;
    this.dataChange.emit({ membroId: this.membro.id!, dataInicio: value });
  }

  onDataFimChange(value: string) {
    this.membro.dataFimIndividual = value;
    this.dataChange.emit({ membroId: this.membro.id!, dataFim: value });

  }

  private isDataValida(valor: string, inicio: string, fim: string): boolean {
    const v = new Date(valor);
    const i = new Date(inicio);
    const f = new Date(fim);

    return v >= i && v <= f;
  }

}
