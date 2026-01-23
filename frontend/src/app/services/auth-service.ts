import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Usuario } from '../components/popUps/add-user/usuario';
import { ToastService } from './toast-service';

export interface LoginResponse {
  token?: string;
  etapa?: '2FA';
  email?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  apiUrl = "http://localhost:3000/auth";

  usuarioEmEdicao?: Usuario;
  usuarioEmDelete?: Usuario;

  constructor(private http: HttpClient, private toast: ToastService) {
    this.carregarUsuarios();
  }

  private tokenSubject = new BehaviorSubject<String | null>(this.getToken());
  token$ = this.tokenSubject.asObservable();

  private usuarioSubject = new BehaviorSubject<Usuario[]>([]);
  usuario$ = this.usuarioSubject.asObservable();

  private loggedUserSubject = new BehaviorSubject<any | null>(null);
  loggedUser$ = this.loggedUserSubject.asObservable();

  login(user: Usuario): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, user).pipe(
      tap((res) => {
        if (res?.token) {
          this.salvarToken(res.token);
          this.tokenSubject.next(res.token);
        }
      })
    );
  }

  private salvarToken(token: string) {
    localStorage.setItem('AUTH_TOKEN', token);
  }

  getToken(): string | null {
    return localStorage.getItem('AUTH_TOKEN');
  }

  logout() {
    localStorage.removeItem('AUTH_TOKEN');
    this.tokenSubject.next(null);
    window.location.href = "/login";
  }

  isLogado(): boolean {
    return !!this.getToken();
  }

  cadastrarUsuario(user: Usuario) {
    return this.http.post(`${this.apiUrl}/signup`, user);
  }

  atualizarBackend(user: Usuario) {
    return this.http.put(`${this.apiUrl}/${user.id}`, user);
  }

  reativarUsuario(user: Usuario) {
    return this.http.put(`${this.apiUrl}/reativar/${user.id}`, user);
  }

  verificarEmail(user: Usuario) {
    const params = new HttpParams().set('email', user.email!);
    return this.http.get<{ exists: boolean }>(`${this.apiUrl}/check-email`, { params });
  }

  buscarUsuarioPorIdBackend(id: string) {
    return this.http.get<Usuario>(`${this.apiUrl}/${id}`);
  }

  getLoggedUser() {
    return this.http.get<Usuario>(
      `${this.apiUrl}/me`,
      { headers: { Authorization: `Bearer ${this.getToken()}` } }
    ).pipe(
      tap((user) => this.loggedUserSubject.next(user))
    );
  }

  desativar(user: Usuario) {
    return this.http.delete(`${this.apiUrl}/desativar/${user.id}`);
  }

  deletar(user: Usuario) {
    return this.http.delete(`${this.apiUrl}/${user.id}`).subscribe({
      next: () => {
        this.carregarUsuarios();
        this.toast.show("Usuário deletado com sucesso!");
      },
      error: err => {
        if (err.status === 403) {
          this.toast.show("Sem permissão para deletar usuário");
          return;
        }

        if (err.status === 401) {
          this.toast.show("O administrador de origem não pode ser deletado");
          return;
        }

        this.toast.show(`Erro ao deletar usuário: ${err.error?.erro}`);
      }
    });;
  }

  obterBackend({ incluirInativos = true }: { incluirInativos?: boolean } = {}) {
    let params = new HttpParams().set('incluirInativos', incluirInativos.toString());
    return this.http.get<Usuario[]>(this.apiUrl, { params });
  }

  carregarUsuarios(incluirInativos = true) {
    this.http.get<Usuario[]>(`${this.apiUrl}?incluirInativos=${incluirInativos}`).subscribe({
      next: (usuarios) => {
        this.usuarioSubject.next(usuarios);
      },
      error: (err) => {
        if (err.status === 401 || err.status === 403) {
          return;
        }
        this.toast.show(`Erro ao carregar usuários: ${err.error?.erro}`);
      }
    });
  }

  verificar2FA(payload: { email: string, codigo: string }) {
    return this.http.post<{ sucesso?: boolean; token?: string, erro?: string }>(`${this.apiUrl}/verificar2fa`, payload);
  }

  atualizar2FA(user: Usuario) {
    return this.http.put(`${this.apiUrl}/toggle2fa`, user);
  }

  changeMyPassword(oldPassword: string, newPassword: string) {
    return this.http.patch(`${this.apiUrl}/me/password`, { oldPassword, newPassword })
  }

  changeMyData(nome: string, email: string) {
    return this.http.patch(`${this.apiUrl}/me`, { nome, email });
  }

  forgotPassword(email: string) {
    return this.http.post(`${this.apiUrl}/forgot-password`, { email });
  }

  resetPassword(token: string, newPassword: string) {
    return this.http.post(`${this.apiUrl}/reset-password`, { token, newPassword });
  }
}
