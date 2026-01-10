import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChangeRequestService {
  apiUrl = "http://localhost:3000/change-request";

  private pendentesSubject = new BehaviorSubject<any[]>([]);
  pendentes$ = this.pendentesSubject.asObservable();

  constructor(private http: HttpClient) { }

  solicitar(tipo: string, dadosNovos: any) {
    return this.http.post(`${this.apiUrl}`, { tipo, dadosNovos });
  }

  carregarPendentes() {
    return this.http.get<any[]>(`${this.apiUrl}`).pipe(
      tap(pendentes => this.pendentesSubject.next(pendentes))
    );
  }
}
