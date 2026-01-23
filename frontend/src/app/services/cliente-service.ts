import { Injectable } from '@angular/core';
import { Cliente } from '../components/popUps/add-cliente/cliente';
import { BehaviorSubject } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { ToastService } from './toast-service';

@Injectable({
  providedIn: 'root'
})

export class ClienteService {
  static REPO_CLIENTE = "_CLIENTES";

  constructor(private http: HttpClient, private toast: ToastService) {
    this.carregarClientes();
  };
  apiUrl = 'https://worknexdeploy-production.up.railway.app/clientes';
  clienteEmEdicao?: Cliente;
  clienteEmDelete?: Cliente;


  private clienteSubject = new BehaviorSubject<Cliente[]>([]);
  cliente$ = this.clienteSubject.asObservable();

  private updateSubject() {
    this.clienteSubject.next(this.obterStorage({ incluirInativos: true }));
  }

  pesquisarCliente(termoBusca: string) {
    return this.obterBackend().pipe(
      map(clientes => {
        if (termoBusca) {
          const termo = termoBusca.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
          return clientes.filter(cliente =>
            cliente.razaoSocial?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(termo) ||
            cliente.cnpj?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(termo) ||
            cliente.nomeFantasia?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(termo) || 
            cliente.nomeCompleto?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(termo) ||
            cliente.email?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(termo)
          );
        }
        return clientes;
      })
    )
  }

  buscarClientePorId(id: string): Cliente | undefined {
    return this.obterStorage().find(c => c.id === id);
  }

  obterStorage({ incluirInativos = false }: { incluirInativos?: boolean } = {}): Cliente[] {
    const repositorioClientes = localStorage.getItem(ClienteService.REPO_CLIENTE);

    if (repositorioClientes) {
      const clientes: Cliente[] = JSON.parse(repositorioClientes);

      return incluirInativos ? clientes : clientes.filter(c => c.isActive !== false);
    }

    const clientes: Cliente[] = [];
    localStorage.setItem(ClienteService.REPO_CLIENTE, JSON.stringify(clientes));
    return clientes;
  }

  salvarBackend(cliente: Cliente) {
    return this.http.post(this.apiUrl, cliente);
  }

  atualizarBackend(cliente: Cliente) {
    return this.http.put(`${this.apiUrl}/${cliente.id}`, cliente);
  }

  deletar(cliente: Cliente) {
    this.http.delete(`${this.apiUrl}/${cliente.id}`).subscribe({
      next: () => this.carregarClientes(),
      error: err => {
        if (err.status === 403) {
          this.toast.show("Sem permissão para deletar cliente");
          return;
        }
        this.toast.show(`Erro ao deletar cliente: ${err.error?.erro}`);
      },
    });
  }

  buscarClientePorIdBackend(id: string) {
    return this.http.get<Cliente>(`${this.apiUrl}/${id}`);
  }

  obterBackend({ incluirInativos = false }: { incluirInativos?: boolean } = {}) {
    let params = new HttpParams().set('incluirInativos', incluirInativos);
    return this.http.get<Cliente[]>(this.apiUrl, { params });
  }

  carregarClientes(incluirInativos = false) {
    this.http.get<Cliente[]>(`${this.apiUrl}?incluirInativos=${incluirInativos}`).subscribe({
      next: (clientes) => this.clienteSubject.next(clientes),
      error: (err) => {
        if (err.status !== 403) {
          this.toast.show(`Erro ao carregar clientes: ${err.error?.erro}`);
        }
      }
    });
  }

  buscarCep(cep: string): Observable<any> {
    cep = cep.replace(/\D/g, '');
    return this.http.get(`https://viacep.com.br/ws/${cep}/json/`);
  }
  
  exportarZIP() {
    return this.http.get(`${this.apiUrl}/exportar`, {
      responseType: 'blob'
    });
  }

}
