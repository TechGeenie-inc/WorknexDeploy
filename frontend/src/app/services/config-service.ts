import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, tap } from 'rxjs';
import { Config } from '../components/config-info/config';
import { ToastService } from './toast-service';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  apiUrl = "https://worknexdeploy-production.up.railway.app/config";

  constructor(private http: HttpClient, private toast: ToastService) {
    this.carregarConfig();
  }

  private configSubject = new BehaviorSubject<Config | null>(null);
  config$ = this.configSubject.asObservable();

  carregarConfig() {
    this.http.get<Config>(this.apiUrl).subscribe({
      next: (config) => this.configSubject.next(config),
      error: err => {
        if (err.status !== 401) {
          this.toast.show(`Erro ao carregar configurações: ${err.error?.erro}`);
        }
      },
    });
  }

  atualizar(dados: Config) {
    return this.http.put<Config>(this.apiUrl, dados).pipe(
      tap((configAtualizada) => {
        this.configSubject.next(configAtualizada);
      })
    );
  }

  obterConfigAtual(): Config | null {
    return this.configSubject.value;
  }
}
