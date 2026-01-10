import { DatePipe, TitleCasePipe } from '@angular/common';
import { Component, Input, OnDestroy } from '@angular/core';
import { CalendarView } from 'angular-calendar';
import { addMonths, addWeeks, endOfMonth, startOfMonth, subMonths, subWeeks } from 'date-fns';
import { Calendar, ChartGantt, ChevronLeft, ChevronRight, LucideAngularModule } from 'lucide-angular';
import { combineLatest, map, Subject, takeUntil } from 'rxjs';
import { CalendarService } from '../../services/calendar-service';
import { EquipeService } from '../../services/equipe-service';
import { GanttItem } from '../gantt-item/gantt-item';
import { Equipe, Status } from '../popUps/add-equipe/equipe';
import { Evento } from '../popUps/add-event/evento';

export interface GanttTask {
  title: string;
  client: string;
  startingDate: Date;
  endingDate: Date;
  status: "Ativo" | "Inativo" | 'Concluido';
  monthLength: number;
  selectedMonth: number;
  selectedYear: number;
}

@Component({
  selector: 'app-gantt-chart',
  imports: [LucideAngularModule, DatePipe, TitleCasePipe, GanttItem],
  templateUrl: './gantt-chart.html',
  styleUrl: './gantt-chart.scss'
})
export class GanttChart implements OnDestroy {

  @Input() items: GanttTask[] = [];
  private destroy$ = new Subject<void>();
  readonly ChartGantt = ChartGantt;
  readonly Calendar = Calendar;
  readonly ChevronLeft = ChevronLeft;
  readonly ChevronRight = ChevronRight;
  viewDate: Date = new Date();
  view: CalendarView = CalendarView.Month;
  private eventosCache: Evento[] = [];
  private equipesCache: Equipe[] = [];


  constructor(
    private readonly calendarService: CalendarService,
    private readonly equipeService: EquipeService,
  ) { }

  ngOnInit() {
    combineLatest([this.calendarService.calendar$, this.equipeService.equipe$])
      .pipe(
        map(([eventos, equipes]) => {
          this.eventosCache = eventos;
          this.equipesCache = equipes;
          return this.buildTasks(eventos, equipes);
        }),
        takeUntil(this.destroy$),
      )
      .subscribe(tasks => (this.items = tasks));
  }

  private rebuildTasks() {
    this.items = this.buildTasks(this.eventosCache, this.equipesCache);
  }

  get selectedMonth(): number {
    return this.viewDate.getMonth() + 1;
  }

  get selectedYear(): number {
    return this.viewDate.getFullYear();
  }

  previousCalendarView() {
    this.viewDate = this.view === CalendarView.Month
      ? subMonths(this.viewDate, 1)
      : subWeeks(this.viewDate, 1);
    this.rebuildTasks();
  }

  nextCalendarView() {
    this.viewDate = this.view === CalendarView.Month
      ? addMonths(this.viewDate, 1)
      : addWeeks(this.viewDate, 1);
    this.rebuildTasks();
  }

  todayCalendarView() {
    this.viewDate = new Date();
    this.rebuildTasks();
  }

  private getMonthLength(date: Date): number {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  }

  private buildTasks(eventos: Evento[], equipes: Equipe[]): GanttTask[] {
    const monthLength = this.getMonthLength(this.viewDate);
    const selectedMonth = this.selectedMonth;
    const selectedYear = this.viewDate.getFullYear();
    const monthStart = startOfMonth(this.viewDate);
    const monthEnd = endOfMonth(this.viewDate);

    return eventos
      .filter(ev => ev.isActive !== false)
      .map(ev => ({
        ...ev,
        start: ev.start ?? new Date(),
        end: ev.end ?? ev.start ?? new Date(),
      }))
      .filter(ev => this.intersectsSelectedMonth(ev.start, ev.end, monthStart, monthEnd))
      .map(ev => {
        const equipe = equipes.find(eq => eq.id === ev.equipeId);
        const cliente = equipe?.cliente;
        return {
          title: equipe?.nomeEquipe ?? ev.title ?? 'Sem nome',
          client:
            cliente?.nomeFantasia ??
            cliente?.nomeCompleto ??
            'Sem Cliente',
          startingDate: ev.start,
          endingDate: ev.end,
          status: this.mapStatus(equipe?.status),
          monthLength,
          selectedMonth,
          selectedYear
        };
      });
  }

  private intersectsSelectedMonth(
    start: Date,
    end: Date,
    monthStart: Date,
    monthEnd: Date,
  ): boolean {
    const normalizedStart = start.getTime();
    const normalizedEnd = end.getTime();
    return normalizedStart <= monthEnd.getTime() && normalizedEnd >= monthStart.getTime();
  }

  private mapStatus(status?: Status): 'Ativo' | 'Inativo' | 'Concluido' {
    if (status === Status.EmAndamento) return 'Ativo';
    if (status === Status.Concluido) return 'Concluido';
    return 'Inativo';
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
