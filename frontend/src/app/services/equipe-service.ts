import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';
import { Equipe, Status } from '../components/popUps/add-equipe/equipe';
import { CalendarService } from './calendar-service';
import { ClienteService } from './cliente-service';
import { ToastService } from './toast-service';

@Injectable({
  providedIn: 'root'
})
export class EquipeService {
  clienteService = inject(ClienteService);
  calendarService = inject(CalendarService);

  static REPO_EQUIPES = "_EQUIPES";

  constructor(private http: HttpClient, private toast: ToastService) {
    this.carregarEquipes();
  };
  apiUrl = 'http://localhost:3000/equipes';
  equipeEmEdicao?: Equipe;
  equipeSelecionada?: Equipe;
  equipeEmDelete?: Equipe;

  private equipeSubject = new BehaviorSubject<Equipe[]>([]);
  equipe$ = this.equipeSubject.asObservable();

  private updateSubject() {
    this.equipeSubject.next(this.obterStorage({ incluirInativos: true }))
  }

  salvar(equipe: Equipe) {
    const storage = this.obterStorage({ incluirInativos: true });
    storage.push(equipe);

    localStorage.setItem(EquipeService.REPO_EQUIPES, JSON.stringify(storage));
    this.equipeSubject.next(storage);
    this.updateSubject();
  };

  atualizar(equipe: Equipe) {
    const storage = this.obterStorage({ incluirInativos: true });
    const index = storage.findIndex(e => e.id === equipe.id);

    if (index !== -1) {
      storage[index] = equipe;

      localStorage.setItem(EquipeService.REPO_EQUIPES, JSON.stringify(storage));
      this.updateSubject();

      const eventos = this.calendarService.obterStorage({ incluirInativos: true });
      eventos
        .filter(ev => ev.equipeId === equipe.id)
        .forEach(ev => {
          ev.title = equipe.nomeEquipe!;
          ev.start = new Date(equipe.dataInicio!);
          ev.end = new Date(equipe.dataFinal!);
          this.calendarService.atualizar(ev);
        });

    }
  };

  pesquisarEquipe(termoBusca: string, filtros?: { status?: Status | 'pausadas' }) {
    return this.obterBackend().pipe(
      map(equipes => {
        const termo = (termoBusca || '')
          .toString()
          .trim()
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '');

        if (termo) {
          equipes = equipes.filter(equipe => {
            const nomeEquipe = (equipe.nomeEquipe || '')
              .toString()
              .toLowerCase()
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '');

            const tarefa = (equipe.tarefa || '')
              .toString()
              .toLowerCase()
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '');

            const nomeFantasia = (equipe.cliente?.nomeFantasia || '')
              .toString()
              .toLowerCase()
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '');

            const razaoSocial = (equipe.cliente?.razaoSocial || '')
              .toString()
              .toLowerCase()
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '');

            const nomeCompleto = (equipe.cliente?.nomeCompleto || '')
              .toString()
              .toLowerCase()
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '');

            return (
              nomeEquipe.includes(termo) ||
              tarefa.includes(termo) ||
              nomeFantasia.includes(termo) ||
              razaoSocial.includes(termo) ||
              nomeCompleto.includes(termo)
            );
          });
        }

        if (filtros?.status) {
          if (filtros.status === 'pausadas') {
            equipes = equipes.filter(
              e => e.status === Status.Impedido || e.status === Status.EmEspera
            );
          } else {
            equipes = equipes.filter(e => e.status === filtros.status);
          }
        }

        return equipes;
      })
    );
  }

  buscarEquipePorId(id: string) {
    return this.obterStorage().find(e => e.id === id);
  }

  obterStorage({ incluirInativos = false }: { incluirInativos?: boolean } = {}): Equipe[] {
    const repositorioEquipes = localStorage.getItem(EquipeService.REPO_EQUIPES);

    if (repositorioEquipes) {
      const equipes: Equipe[] = JSON.parse(repositorioEquipes);

      return incluirInativos ? equipes : equipes.filter(e => e.isActive !== false);
    }

    const equipes: Equipe[] = [];
    localStorage.setItem(EquipeService.REPO_EQUIPES, JSON.stringify(equipes));
    return equipes;
  }

  setStatus(equipeId: string, status: Status) {
    this.http.put(`${this.apiUrl}/${equipeId}/status`, { status: status }).subscribe({
      next: () => {
        this.carregarEquipes();
        this.clienteService.carregarClientes();
      },
      error: err => {
        if (err.status === 403) {
          this.toast.show("Sem permissão para atualizar status da equipe");
        } else {
          this.toast.show("Erro ao atualizar status da equipe");
        }
      }
    });
  }

  getEquipesAtuais(onlyAtivas: boolean = true): Equipe[] {
    const equipes = this.equipeSubject.value;
    return onlyAtivas ? equipes.filter(e => e.isActive !== false) : equipes;
  }

  salvarBackend(equipe: Equipe) {
    return this.http.post(this.apiUrl, equipe);
  }

  atualizarBackend(equipe: Equipe) {
    return this.http.put(`${this.apiUrl}/${equipe.id}`, equipe);
  }

  deletar(equipe: Equipe) {
    this.http.delete(`${this.apiUrl}/${equipe.id}`).subscribe({
      next: () => {
        this.carregarEquipes();
        this.clienteService.carregarClientes();
      },
      error: err => {
        if (err.status === 403) {
          this.toast.show("Sem permissão para deletar equipe");
          return;
        }

        this.toast.show("Erro ao deletar equipe");
      }
    });

  }

  buscarEquipePorIdBackend(id: string) {
    return this.http.get<Equipe>(`${this.apiUrl}/${id}`);
  }

  obterBackend({ incluirInativos = false }: { incluirInativos?: boolean } = {}) {
    let params = new HttpParams().set('incluirInativos', incluirInativos);
    return this.http.get<Equipe[]>(this.apiUrl, { params });
  }

  carregarEquipes(incluirInativos = false) {
    this.http.get<Equipe[]>(`${this.apiUrl}?incluirInativos=${incluirInativos}`).subscribe({
      next: (equipes) => this.equipeSubject.next(equipes),
      error: (err) => {
        if (err.status !== 403) {
          this.toast.show("Erro ao carregar equipes");
        }
      }
    });
  }

  exportarZIP() {
    return this.http.get(`${this.apiUrl}/exportar`, {
      responseType: 'blob'
    });
  }
}
