import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ToastService } from './toast-service';

@Injectable({
  providedIn: 'root'
})
export class SaldoService {
  static REPO_CAIXA = "_CAIXA";

  private apiUrl = 'https://worknexdeploy-production.up.railway.app/saldo';

  private saldoSubject =  new BehaviorSubject<number>(0);
  saldo$ = this.saldoSubject.asObservable();

  constructor(private http: HttpClient, private toast: ToastService) {
    this.carregarSaldo();
  }

  getSaldo(): number {
    return this.saldoSubject.value;
  }

  carregarSaldo() {
    this.http.get<any>(this.apiUrl).subscribe({
      next: (resp) => {
        const valor = resp?.total ?? 0;
        this.saldoSubject.next(valor);
      },
      error: err => {
        if (err.status !== 403) {
          this.toast.show(`Erro ao limpar dados: ${err.error?.erro}`);
        }
      }
    });
  }

  adicionar(valor: number): void {
    const novoSaldo = this.saldoSubject.value + valor;
    this.salvar(novoSaldo);
  }

  remover(valor: number): void {
    const novoSaldo = this.saldoSubject.value - valor;
    this.salvar(novoSaldo);
  }

  setSaldo(valor: number): void {
    this.salvar(valor);
  }

  private obterStorage() {
    const repo = localStorage.getItem(SaldoService.REPO_CAIXA);
    if (repo) {
      return Number(repo);
    }
    localStorage.setItem(SaldoService.REPO_CAIXA, "0");
    return 0;
  }

  private salvar(valor: number): void {
    localStorage.setItem(SaldoService.REPO_CAIXA, valor.toString());
    this.saldoSubject.next(valor);
  }

  atualizar(): void {
    this.saldoSubject.next(this.obterStorage());
  }


}
