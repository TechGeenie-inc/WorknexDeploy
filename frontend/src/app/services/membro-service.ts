import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Membro } from '../components/popUps/add-member/membro';
import { Equipe } from '../components/popUps/add-equipe/equipe';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map } from 'rxjs';
import { EquipeService } from './equipe-service';
import { Dialog } from '@angular/cdk/dialog';
import { AvisoDelete } from '../components/popUps/aviso-delete/aviso-delete';
import { ToastService } from './toast-service';

@Injectable({
  providedIn: 'root'
})
export class MembroService {
  static REPO_MEMBROS = "_MEMBROS";

  serviceEquipe = inject(EquipeService);
  dialog = inject(Dialog);

  constructor(private http: HttpClient, private toast: ToastService) {
    this.carregarMembros();
  };
  membroEmEdicao?: Membro;
  membroEmDelete?: Membro;
  equipesDoMembroEmDelete: Equipe[] = [];
  apiUrl = 'https://worknexdeploy-production.up.railway.app/membros';

  private membrosSubject = new BehaviorSubject<Membro[]>([]);
  membros$ = this.membrosSubject.asObservable();

  private updateSubject() {
    this.membrosSubject.next(this.obterStorage({ incluirInativos: true }));
  }

  salvar(membro: Membro) {
    const storage = this.obterStorage({ incluirInativos: true });
    storage.push(membro);

    localStorage.setItem(MembroService.REPO_MEMBROS, JSON.stringify(storage));
    this.updateSubject();
  }

  atualizar(membro: Membro) {
    const storage = this.obterStorage({ incluirInativos: true });
    const index = storage.findIndex(m => m.id === membro.id);

    if (index !== -1) {
      storage[index] = membro; // substitui os dados antigos
      localStorage.setItem(MembroService.REPO_MEMBROS, JSON.stringify(storage));
      this.updateSubject();
    }
  }

  pesquisarMembro(termoBusca: string, filtros?: { funcaoId?: string | string[], status?: 'ativo' | 'inativo' }) {
    return this.obterBackend().pipe(
      map(membros => {
        const termo = (termoBusca || '').toString().trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

        if (termo) {
          membros = membros.filter(membro => {
            const nome = (membro.nome || '').toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            const cpf = (membro.cpf || '').toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            const funcaoNome = (membro.funcao?.nomeFuncao || '').toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            return nome.includes(termo) || cpf.includes(termo) || funcaoNome.includes(termo);
          });
        }

        if (filtros) {
          if (filtros.funcaoId) {
            const ids = Array.isArray(filtros.funcaoId) ? filtros.funcaoId : [filtros.funcaoId];
            membros = membros.filter(m => ids.includes(m.funcaoId ?? ''));
          }
          if (filtros.status) {
            membros = membros.filter(m => m.status === filtros.status);
          }
        }
        return membros;
      })
    );
  }

  buscarMembroPorId(id: string): Membro | undefined {
    return this.obterStorage({ incluirInativos: true }).find(m => m.id === id);
  }

  private obterStorage({ incluirInativos = false }: { incluirInativos?: boolean } = {}): Membro[] {
    const repositorioMembros = localStorage.getItem(MembroService.REPO_MEMBROS);

    if (repositorioMembros) {
      const membros: Membro[] = JSON.parse(repositorioMembros);
      return incluirInativos ? membros : membros.filter(m => m.isActive !== false);
    }

    const membros: Membro[] = [];
    localStorage.setItem(MembroService.REPO_MEMBROS, JSON.stringify(membros));
    return membros;
  }

  setStatus(membroId: string, status: 'ativo' | 'inativo') {
    this.http.put(`${this.apiUrl}/${membroId}`, { status }).subscribe({
      next: () => {
        this.carregarMembros();
      },
      error: err => {
        if (err.status === 403) {
          this.toast.show("Sem permissão para atualizar status do membro");
          return;
        }

        this.toast.show(`Erro ao atualizar status do membro: ${err.error?.erro}`);
      }
    });
  }

  salvarBackend(membro: Membro) {
    return this.http.post(this.apiUrl, membro);
  }

  atualizarBackend(membro: Membro) {
    return this.http.put(`${this.apiUrl}/${membro.id}`, membro);
  }

  deletar(membro: Membro) {
    this.serviceEquipe.obterBackend().subscribe({
      next: (equipes) => {
        const equipesDoMembro = equipes.filter(
          (e: any) => e.membros?.some((m: any) => m.id === membro.id)
        );

        if (equipesDoMembro.length > 0) {
          this.equipesDoMembroEmDelete = equipesDoMembro;
          this.dialog.open(AvisoDelete);
          return;
        }

        this.http.delete(`${this.apiUrl}/${membro.id}`).subscribe({
          next: () => {
            this.carregarMembros();
          },
          error: (err) => {
            if (err.status === 403) {
              this.toast.show("Sem permissão para deletar membro");
            } else {
              this.toast.show(`Erro ao deletar membro: ${err.error?.erro}`);
            }
          },
        });
      },
      error: (err) => {
        if (err.status === 403) {
          this.toast.show("Erro ao verificar em quais equipes o membro está");
        } else {
          this.toast.show(`Erro ao deletar membro: ${err.error?.erro}`);
        }
      }
    });
  }


  buscarMembroPorIdBackend(id: string) {
    return this.http.get<Membro>(`${this.apiUrl}/${id}`);
  }

  obterBackend({ incluirInativos = false }: { incluirInativos?: boolean } = {}) {
    let params = new HttpParams().set('incluirInativos', incluirInativos);
    return this.http.get<Membro[]>(this.apiUrl, { params });
  }

  carregarMembros(incluirInativos = false) {
    this.http.get<Membro[]>(`${this.apiUrl}?incluirInativos=${incluirInativos}`).subscribe({
      next: (membros) => this.membrosSubject.next(membros),
      error: (err) => {
        if (err.status !== 403) {
          this.toast.show(`Erro ao carregar membros: ${err.error?.erro}`);
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
