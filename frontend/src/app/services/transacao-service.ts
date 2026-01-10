import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';
import { Transacao } from '../components/popUps/add-transacao/transacao';
import { SaldoService } from './saldo-service';
import { ToastService } from './toast-service';

@Injectable({
  providedIn: 'root'
})
export class TransacaoService {
  private saldoService = inject(SaldoService);

  constructor(private http: HttpClient, private toast: ToastService) {
    this.carregarTransacoes();
  };
  apiUrl = 'http://localhost:3000/transacoes';

  static REPO_TRANSACAO = "_TRANSACAO";
  transacaoEmEdicao?: Transacao;
  transacaoEmDelete?: Transacao;

  private transacaoSubject = new BehaviorSubject<Transacao[]>([]);
  transacao$ = this.transacaoSubject.asObservable();

  salvar(transacao: Transacao) {
    const storage = this.obterStorage();
    storage.push(transacao);

    localStorage.setItem(TransacaoService.REPO_TRANSACAO, JSON.stringify(storage));
    this.transacaoSubject.next(storage);

    this.atualizarSaldo(transacao, "add");
  }

  atualizar(transacao: Transacao) {
    const storage = this.obterStorage();
    const index = storage.findIndex(t => t.id === transacao.id);

    if (index !== -1) {
      storage[index] = transacao;
      localStorage.setItem(TransacaoService.REPO_TRANSACAO, JSON.stringify(storage));
      this.transacaoSubject.next(storage);

      this.atualizarSaldo(transacao, "remove");
      this.atualizarSaldo(transacao, "add");
    }
  }

  filtrarPorTipo(tipo?: 'receita' | 'despesa') {
    return this.obterBackend().pipe(
      map(transacoes => {
        if (tipo === 'receita') {
          transacoes = transacoes.filter(t => t.tipo === 'receita');
        }
        else if (tipo === 'despesa') {
          transacoes = transacoes.filter(t => t.tipo === 'despesa' || t.tipo === 'despesaOperacional');
        }

        return transacoes;
      })
    );
  }

  pesquisarTransacao(termoBusca: string) {
    const transacao = this.obterStorage();
    if (!termoBusca) {
      return transacao;
    }
    const termo = termoBusca.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return transacao.filter(transacao =>
      transacao.desc?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(termo)
    );
  }

  buscarTransacaoPorId(id: string) {
    return this.obterStorage().find(t => t.id === id);
  }

  obterStorage({ incluirInativos = false }: { incluirInativos?: boolean } = {}) {
    const repositorioTransacao = localStorage.getItem(TransacaoService.REPO_TRANSACAO);
    if (repositorioTransacao) {
      const transacoes: Transacao[] = JSON.parse(repositorioTransacao);
      return incluirInativos ? transacoes : transacoes.filter(t => t.isActive !== false);
    }

    const transacoes: Transacao[] = [];
    localStorage.setItem(TransacaoService.REPO_TRANSACAO, JSON.stringify(transacoes));
    return transacoes;
  }

  private atualizarSaldo(transacao: Transacao, acao: "add" | "remove") {
    const valor = transacao.valor ?? 0;
    if (transacao.tipo === "receita") {
      acao === "add" ? this.saldoService.adicionar(valor) : this.saldoService.remover(valor);
    } else if (transacao.tipo === "despesa" || transacao.tipo === "despesaOperacional") {
      acao === "add" ? this.saldoService.remover(valor) : this.saldoService.adicionar(valor);
    }
  }



  getResumo() {
    return this.http.get<{
      receitaTotal: number,
      receitaMensal: number,
      despesaTotal: number,
      despesaMensal: number,
      fluxoLiquido: number,
      qtdTransacoes: number
    }>(`${this.apiUrl}/resumo`);
  }


  salvarBackend(transacao: Transacao) {
    return this.http.post(this.apiUrl, transacao);
  }

  atualizarBackend(transacao: Transacao) {
    return this.http.put(`${this.apiUrl}/${transacao.id}`, transacao);
  }

  deletar(transacao: Transacao) {
    this.http.delete(`${this.apiUrl}/${transacao.id}`).subscribe({
      next: () => this.carregarTransacoes(),
      error: err => {
        if (err.status) {
          this.toast.show("Sem permissão para deletar transações");
        } else {
          this.toast.show("Erro ao deletar transação");
        }
      }
    });
  }

  buscarClientePorIdBackend(id: string) {
    return this.http.get<Transacao>(`${this.apiUrl}/${id}`);
  }

  obterBackend({ incluirInativos = false }: { incluirInativos?: boolean } = {}) {
    let params = new HttpParams().set('incluirInativos', incluirInativos);
    return this.http.get<Transacao[]>(this.apiUrl, { params });
  }

  carregarTransacoes(incluirInativos = false) {
    this.http.get<Transacao[]>(`${this.apiUrl}?incluirInativos=${incluirInativos}`).subscribe({
      next: (transacoes) => this.transacaoSubject.next(transacoes),
      error: (err) => {
        if (err.status !== 403) {
          this.toast.show("Erro ao carregar transações");
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
