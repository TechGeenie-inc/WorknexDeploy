import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Funcao } from '../components/popUps/add-funcao/funcao';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map } from 'rxjs';
import { ToastService } from './toast-service';

@Injectable({
  providedIn: 'root'
})
export class FuncaoService {

  static REPO_FUNCOES = "_FUNCOES";

  constructor(private http: HttpClient, private toast: ToastService) {
    this.carregarFuncoes();
  };
  apiUrl = 'https://worknexdeploy-production.up.railway.app/funcoes';
  funcaoEmEdicao?: Funcao;
  funcaoEmDelete?: Funcao;


  private funcaoSubject = new BehaviorSubject<Funcao[]>([]);
  funcao$ = this.funcaoSubject.asObservable();


  private updateSubject() {
    this.funcaoSubject.next(this.obterStorage({ incluirInativos: true }));
  }

  salvar(funcao: Funcao) {
    const storage = this.obterStorage({ incluirInativos: true });
    storage.push(funcao);
    localStorage.setItem(FuncaoService.REPO_FUNCOES, JSON.stringify(storage));
    this.updateSubject();
  }

  atualizar(funcao: Funcao) {
    const storage = this.obterStorage({ incluirInativos: true });
    const index = storage.findIndex(f => f.id === funcao.id);

    if (index !== -1) {
      storage[index] = funcao;
      localStorage.setItem(FuncaoService.REPO_FUNCOES, JSON.stringify(storage));
      this.updateSubject();
    }
  }

  private obterStorage({ incluirInativos = false }: { incluirInativos?: boolean } = {}) {
    const repositorioFuncoes = localStorage.getItem(FuncaoService.REPO_FUNCOES);

    if (repositorioFuncoes) {
      const funcoes: Funcao[] = JSON.parse(repositorioFuncoes);
      return incluirInativos ? funcoes : funcoes.filter(f => f.isActive !== false);
    }

    const funcoes: Funcao[] = [];
    localStorage.setItem(FuncaoService.REPO_FUNCOES, JSON.stringify(funcoes));
    return funcoes;
  }

  buscarFuncaoPorId(id: string): Funcao | undefined {
    return this.obterStorage({ incluirInativos: true }).find(f => f.id === id);
  }

  pesquisarFuncao(termoBusca: string) {
    return this.obterBackend().pipe(
      map(funcoes => {
        if (termoBusca) {
          const termo = termoBusca.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

          return funcoes.filter(funcao => funcao.nomeFuncao?.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(termo));
        }
        return funcoes;
      })
    )
  }

  salvarBackend(funcao: Funcao) {
    return this.http.post(this.apiUrl, funcao);
  }

  atualizarBackend(funcao: Funcao) {
    return this.http.put(`${this.apiUrl}/${funcao.id}`, funcao);
  }

  deletar(funcao: Funcao) {
    this.http.delete(`${this.apiUrl}/${funcao.id}`).subscribe({
      next: () => this.carregarFuncoes(),
      error: err => {
        if (err.status === 403) {
          this.toast.show("Sem permissão para deletar funções");
        } else {
          this.toast.show(`Erro ao deletar função: ${err.error?.erro}`);
        }
      }
    });
  }

  obterBackend({ incluirInativos = false }: { incluirInativos?: boolean } = {}) {
    let params = new HttpParams().set('incluirInativos', incluirInativos);
    return this.http.get<Funcao[]>(this.apiUrl, { params });
  }

  buscarFuncaoPorIdBackend(id: string) {
    return this.http.get<Funcao>(`${this.apiUrl}/${id}`);
  }

  carregarFuncoes(incluirInativos = false) {
    this.http.get<Funcao[]>(`${this.apiUrl}?incluirInativos=${incluirInativos}`).subscribe({
      next: (funcoes) => this.funcaoSubject.next(funcoes),
      error: (err) => {
        if (err.status !== 403) {
          this.toast.show(`Erro ao carregar funções: ${err.error?.erro}`);
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
