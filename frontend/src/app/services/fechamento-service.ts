import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';
import { Fechamento } from '../components/tabelas/add-fechamento/fechamento';
import { EquipeService } from './equipe-service';
import { ClienteService } from './cliente-service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ToastService } from './toast-service';

@Injectable({
  providedIn: 'root'
})
export class FechamentoService {
  static REPO_FECHAMENTO = "_FECHAMENTO";

  equipeService = inject(EquipeService);
  clienteService = inject(ClienteService);

  constructor(private http: HttpClient, private toast: ToastService) {
    this.carregarFechamentos();
  };
  apiUrl = 'http://localhost:3000/fechamentos';
  fechamentoEmEdicao?: Fechamento;
  fechamentoSelecionado?: Fechamento;
  fechamentoEmDelete?: Fechamento;

  private fechamentoSubject = new BehaviorSubject<Fechamento[]>([]);
  fechamento$ = this.fechamentoSubject.asObservable();

  private updateSubject() {
    this.fechamentoSubject.next(this.obterStorage({ incluirInativos: true }));
  }

  salvar(fechamento: Fechamento) {
    const storage = this.obterStorage({ incluirInativos: true });
    storage.push(fechamento);

    localStorage.setItem(FechamentoService.REPO_FECHAMENTO, JSON.stringify(storage));
    this.updateSubject();
  }

  atualizar(fechamento: Fechamento) {
    const storage = this.obterStorage({ incluirInativos: true });
    const index = storage.findIndex(f => f.id === fechamento.id);

    if (index !== -1) {
      storage[index] = fechamento;
      localStorage.setItem(FechamentoService.REPO_FECHAMENTO, JSON.stringify(storage));
      this.updateSubject();
    }
  }

  pesquisarFechamento(termoBusca: string) {
    return this.obterBackend().pipe(
      map(fechamentos => {
        const termo = (termoBusca || '')
          .toString()
          .trim()
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '');

        if (termo) {
          fechamentos = fechamentos.filter(fechamento => {
            const nomeEquipe = (fechamento.equipe?.nomeEquipe || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            const tarefa = (fechamento.equipe?.tarefa || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            const razaoSocial = (fechamento.equipe?.cliente?.razaoSocial || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            const nomeFantasia = (fechamento.equipe?.cliente?.nomeFantasia || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            const nomeCompleto = (fechamento.equipe?.cliente?.nomeCompleto || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

            return (
              nomeEquipe.includes(termo) ||
              tarefa.includes(termo) ||
              razaoSocial.includes(termo) ||
              nomeFantasia.includes(termo) ||
              nomeCompleto.includes(termo)
            );
          });
        }

        return fechamentos;
      })
    );
  }

  buscarFechamentoPorId(id: string) {
    return this.obterStorage().find(f => f.id === id);
  }

  obterStorage({ incluirInativos = false }: { incluirInativos?: boolean } = {}): Fechamento[] {
    const repositorioFechamento = localStorage.getItem(FechamentoService.REPO_FECHAMENTO);
    if (repositorioFechamento) {
      const fechamentos: Fechamento[] = JSON.parse(repositorioFechamento);
      return incluirInativos ? fechamentos : fechamentos.filter(f => f.isActive !== false);
    }

    const fechamentos: Fechamento[] = [];
    localStorage.setItem(FechamentoService.REPO_FECHAMENTO, JSON.stringify(fechamentos));
    return fechamentos;
  };

  setStatus(fechamentoId: string, concluido: boolean) {
    this.http.put(`${this.apiUrl}/${fechamentoId}`, { status: concluido }).subscribe({
      next: (fechamento) => {
        this.carregarFechamentos();
      },
      error: err => {
        if (err.status !== 403) {
          this.toast.show("Sem permissão para atualizar status do fechamento");
          return;
        }

        this.toast.show("Erro ao atualizar status do fechamento");
      }
    });
  }

  salvarBackend(fechamento: Fechamento) {
    return this.http.post(this.apiUrl, fechamento);
  }

  atualizarBackend(fechamento: Fechamento) {
    return this.http.put(`${this.apiUrl}/${fechamento.id}`, fechamento);
  }

  buscarFechamentoPorIdBackend(id: string) {
    return this.http.get<Fechamento>(`${this.apiUrl}/${id}`);
  }

  deletar(fechamento: Fechamento) {
    return this.http.delete(`${this.apiUrl}/${fechamento.id}`).subscribe({
      next: () => {
        this.carregarFechamentos();
      },
      error: err => {
        if (err.status === 403) {
          this.toast.show("Sem permissão para deletar fechamento");
          return;
        }

        this.toast.show("Erro ao deletar fechamento");
      }
    });
  }

  obterBackend({ incluirInativos = false }: { incluirInativos?: boolean } = {}) {
    let params = new HttpParams().set('incluirInativos', incluirInativos);
    return this.http.get<Fechamento[]>(this.apiUrl, { params });
  }

  carregarFechamentos(incluirInativos = false) {
    this.http.get<Fechamento[]>(`${this.apiUrl}?incluirInativos=${incluirInativos}`).subscribe({
      next: (fechamentos) => this.fechamentoSubject.next(fechamentos),
      error: (err) => {
        if (err.status !== 403) {
          this.toast.show("Erro ao carregar fechamentos");
        }
      }
    });
  }

  exportarZIP() {
    return this.http.get(`${this.apiUrl}/exportar`, {
      responseType: 'blob'
    });
  }

  updateExport(id: string, exportFlag: boolean) {
    return this.http.patch(`${this.apiUrl}/${id}/exportUpdate`, { export: exportFlag });
  }

  resetExport() {
    return this.http.patch(`${this.apiUrl}/reset-export`, {});
  }
}
