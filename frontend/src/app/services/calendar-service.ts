import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Evento } from '../components/popUps/add-event/evento';
import { Equipe } from '../components/popUps/add-equipe/equipe';
import { EventColor } from 'calendar-utils';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map } from 'rxjs';
import { ToastService } from './toast-service';

@Injectable({
  providedIn: 'root'
})
export class CalendarService {
  static REPO_EVENTOS = "_EVENTOS"

  private calendarSubject = new BehaviorSubject<Evento[]>([]);
  calendar$ = this.calendarSubject.asObservable()

  constructor(private http: HttpClient, private toast: ToastService) {
    this.carregarEventos();
  };
  apiUrl = 'https://worknexdeploy-production.up.railway.app/eventos';
  eventoEmEdicao?: Evento;
  eventoEmDelete?: Evento;

  private corrigirFuso(data: any): Date {
    if (!data) return new Date();
    const d = new Date(data);
    d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
    return d;
  }

  private updateSubject() {
    this.calendarSubject.next(this.obterStorage({ incluirInativos: true }))
  }

  salvar(evento: Evento) {
    const storage = this.obterStorage({ incluirInativos: true });
    storage.push({
      ...evento,
      start: this.corrigirFuso(evento.start),
      end: this.corrigirFuso(evento.end!)
    });

    localStorage.setItem(CalendarService.REPO_EVENTOS, JSON.stringify(storage));
    this.updateSubject();
  }

  atualizar(evento: Evento) {
    const storage = this.obterStorage({ incluirInativos: true });
    const index = storage.findIndex(e => e.id === evento.id);

    if (index !== -1) {
      storage[index] = {
        ...evento,
        start: this.corrigirFuso(evento.start),
        end: this.corrigirFuso(evento.end!)
      };
      localStorage.setItem(CalendarService.REPO_EVENTOS, JSON.stringify(storage));
      this.updateSubject();
    }
  }

  buscarEventoPorId(id: string): Evento | undefined {
    return this.obterStorage().find(e => e.id === id);
  }

  obterStorage({ incluirInativos = false }: { incluirInativos?: boolean } = {}): Evento[] {
    const repositorioCalendario = localStorage.getItem(CalendarService.REPO_EVENTOS);

    if (repositorioCalendario) {
      const eventos: Evento[] = JSON.parse(repositorioCalendario).map((e: any) => ({
        ...e,
        start: this.corrigirFuso(e.start),
        end: this.corrigirFuso(e.end)
      }));
      return incluirInativos ? eventos : eventos.filter(e => e.isActive !== false);
    }

    const eventos: Evento[] = [];
    localStorage.setItem(CalendarService.REPO_EVENTOS, JSON.stringify(eventos));
    return eventos;
  }

  criarEventoDaEquipe(equipe: Equipe) {
    if (!equipe || !equipe.dataInicio) return;

    const evento: Evento = Evento.newEvento();
    evento.equipeId = equipe.id;
    evento.title = equipe.nomeEquipe!;
    evento.start = this.corrigirFuso(equipe.dataInicio);
    evento.end = this.corrigirFuso(equipe.dataFinal!);
    evento.color = this.randomColor();

    this.salvar(evento);
  }

  randomColor(): EventColor {
    const cores = [
      { primary: '#1E90FF', secondary: '#D0E8FF' },
      { primary: '#FF5733', secondary: '#FFD8CC' },
      { primary: '#28A745', secondary: '#DFF5E1' },
      { primary: '#FFC300', secondary: '#FFF3CC' },
      { primary: '#6F42C1', secondary: '#E3D7F7' },
      { primary: '#E83E8C', secondary: '#F8D0E3' },
      { primary: '#DC3545', secondary: '#F7D0D4' },
      { primary: '#20C997', secondary: '#D1F2EB' },
      { primary: '#8B0000', secondary: '#F2DADA' },
      { primary: '#ADFF2F', secondary: '#EDFFD6' },
      { primary: '#FF00FF', secondary: '#FFD6FF' },
      { primary: '#A52A2A', secondary: '#E8CFCF' },
      { primary: '#17A2B8', secondary: '#D0F0F5' },
      { primary: '#FFD700', secondary: '#FFF8CC' },
      { primary: '#9370DB', secondary: '#E6D9F7' },
      { primary: '#F5F5DC', secondary: '#FFFFFF' },
      { primary: '#32CD32', secondary: '#D6F7D6' },
      { primary: '#9966CC', secondary: '#E8DFF7' }
    ];
    return cores[Math.floor(Math.random() * cores.length)];
  }

  salvarBackend(evento: Evento) {
    return this.http.post(this.apiUrl, evento);
  }

  atualizarBackend(evento: Evento) {
    return this.http.put(`${this.apiUrl}/${evento.id}`, evento);
  }

  deletar(evento: Evento) {
    this.http.delete(`${this.apiUrl}/${evento.id}`).subscribe({
      next: () => this.carregarEventos(),
      error: err => {
        this.toast.show("Erro ao deletar evento");
      },
    });
  }

  buscarEventoPorIdBackend(id: string) {
    return this.http.get<Evento>(`${this.apiUrl}/${id}`);
  }

  obterBackend({ incluirInativos = false }: { incluirInativos?: boolean } = {}) {
    let params = new HttpParams().set('incluirInativos', incluirInativos);
    return this.http.get<Evento[]>(this.apiUrl, { params }).pipe(
      map(eventos => 
        eventos.map(e => ({
          ...e,
          start: new Date(e.start),
          end: e.end ? new Date(e.end) : undefined
        }))
      )
    );
  }

  carregarEventos(incluirInativos = false) {
    this.http.get<Evento[]>(`${this.apiUrl}?incluirInativos=${incluirInativos}`).subscribe({
      next: (eventos) => {
        const eventosConvertidos = eventos.map(e => ({
          ...e,
          start: new Date(e.start),
          end: e.end ? new Date(e.end) : undefined
        }));
        this.calendarSubject.next(eventosConvertidos);
      },
      error: (err) => {
        if (err.status !== 403) {
          this.toast.show("Erro ao carregar eventos");
        }
      }
    });
  }

}
