import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';
import { Fatura } from '../components/popUps/add-fatura/fatura';
import { ToastService } from './toast-service';

@Injectable({
  providedIn: 'root'
})
export class FaturaService {
  static REPO_FATURA = "_FATURA"

  constructor(private http: HttpClient, private toast: ToastService) {
    this.carregarFaturas();
  };
  faturaEmEdicao?: Fatura;
  faturaEmDelete?: Fatura;
  apiUrl = 'http://localhost:3000/faturas';

  private faturaSubject = new BehaviorSubject<Fatura[]>([]);
  fatura$ = this.faturaSubject.asObservable();

  private updateSubject() {
    this.faturaSubject.next(this.obterStorage({ incluirInativos: true }));
  }

  salvar(fatura: Fatura) {
    const storage = this.obterStorage({ incluirInativos: true });
    const maxFriendlyId = storage.length > 0
      ? Math.max(...storage.map(f => f.friendlyId || 0))
      : 0;

    fatura.friendlyId = maxFriendlyId + 1;
    storage.push(fatura);

    localStorage.setItem(FaturaService.REPO_FATURA, JSON.stringify(storage));
    this.verifyOverdue()
  }

  atualizar(fatura: Fatura) {
    const storage = this.obterStorage({ incluirInativos: true });
    const index = storage.findIndex(f => f.id === fatura.id);

    if (index !== -1) {
      storage[index] = fatura;
      localStorage.setItem(FaturaService.REPO_FATURA, JSON.stringify(storage));
      this.verifyOverdue()
    }
  }

  pesquisarFatura(termoBusca: string, filtroStatus?: 'pendente' | 'pago' | 'vencido') {
    return this.obterBackend().pipe(
      map(faturas => {
        if (filtroStatus) {
          faturas = faturas.filter(f => f.status === filtroStatus);
        }
        const termo = (termoBusca || '')
          .toString()
          .trim()
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '');
        if (termo) {
          faturas = faturas.filter(faturas => {
            const cliente = (faturas.fechamento?.equipe?.cliente?.razaoSocial || faturas.fechamento?.equipe?.cliente?.nomeFantasia || faturas.fechamento?.equipe?.cliente?.nomeCompleto || '')
              .toString()
              .toLowerCase()
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '');

            const equipe = (faturas.fechamento?.equipe?.nomeEquipe || '')
              .toString()
              .toLowerCase()
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '');
            return (
              cliente.includes(termo) ||
              equipe.includes(termo)
            );
          });
        };
        return faturas;
      })
    );
  }

  buscarFaturaPorId(id: string) {
    return this.obterStorage().find(f => f.id === id);
  }

  obterStorage({ incluirInativos = false }: { incluirInativos?: boolean } = {}): Fatura[] {
    const repositorioFatura = localStorage.getItem(FaturaService.REPO_FATURA);
    if (repositorioFatura) {
      const faturas: Fatura[] = JSON.parse(repositorioFatura);
      return incluirInativos ? faturas : faturas.filter(f => f.isActive !== false);
    }

    const faturas: Fatura[] = [];
    localStorage.setItem(FaturaService.REPO_FATURA, JSON.stringify(faturas));
    return faturas;
  }

  verifyOverdue() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const faturasAtualizadas = this.obterStorage().map(fatura => {
      if (fatura.status === 'pendente' && fatura.vencimento) {
        const vencimento = new Date(fatura.vencimento);
        vencimento.setHours(0, 0, 0, 0);
        if (vencimento < today) {
          return { ...fatura, status: 'vencido' as 'vencido' };
        }
      }
      return fatura;
    });
    localStorage.setItem(FaturaService.REPO_FATURA, JSON.stringify(faturasAtualizadas));

    this.faturaSubject.next(faturasAtualizadas);
  }

  setStatus(faturaId: string, status: 'pago' | 'pendente') {
    return this.http.put(`${this.apiUrl}/${faturaId}/status`, { status: status });
  }

  salvarBackend(fatura: Fatura) {
    return this.http.post(this.apiUrl, fatura);
  }

  atualizarBackend(fatura: Fatura) {
    return this.http.put(`${this.apiUrl}/${fatura.id}`, fatura);
  }

  deletar(fatura: Fatura) {
    this.http.delete(`${this.apiUrl}/${fatura.id}`).subscribe({
      next: () => {
        this.carregarFaturas();
      },
      error: err => {
        if (err.status === 403) {
          this.toast.show("Sem permissão para deletar fatura");
          return;
        }
        this.toast.show(`Erro ao deletar fatura: ${err.error?.erro}`);
      }
    });
  }

  buscarFaturaPorIdBackend(id: string) {
    return this.http.get<Fatura>(`${this.apiUrl}/${id}`);
  }

  obterBackend({ incluirInativos = false }: { incluirInativos?: boolean } = {}) {
    let params = new HttpParams().set('incluirInativos', incluirInativos);
    return this.http.get<Fatura[]>(this.apiUrl, { params });
  }

  carregarFaturas(incluirInativos = false) {
    return this.http.get<Fatura[]>(`${this.apiUrl}?incluirInativos=${incluirInativos}`).subscribe({
      next: (faturas) => this.faturaSubject.next(faturas),
      error: (err) => {
        if (err.status !== 403) {
          this.toast.show(`Erro ao carregar faturas: ${err.error?.erro}`);
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
