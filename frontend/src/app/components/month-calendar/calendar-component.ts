import { DatePipe, TitleCasePipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CalendarDayViewComponent, CalendarMonthViewComponent, CalendarView, CalendarWeekViewComponent, DateAdapter, provideCalendar } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { addDays, addMonths, addWeeks, endOfWeek, format, startOfWeek, subDays, subMonths, subWeeks } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, CalendarPlus, ChevronLeft, ChevronRight, Clock, LucideAngularModule } from "lucide-angular";
import { CalendarService } from '../../services/calendar-service';
import { AddEvent } from '../popUps/add-event/add-event';
import { Dialog } from '@angular/cdk/dialog';
import { Evento } from '../popUps/add-event/evento';
import { PermissionService } from '../../services/permission-service';
import { ToastService } from '../../services/toast-service';


@Component({
  selector: 'app-calendar-component',
  imports: [
    CalendarMonthViewComponent,
    CalendarWeekViewComponent,
    CalendarDayViewComponent,
    FormsModule,
    DatePipe,
    TitleCasePipe,
    LucideAngularModule,
  ],
  providers:
    [
      provideCalendar({ provide: DateAdapter, useFactory: adapterFactory })
    ],
  templateUrl: './calendar-component.html',
  styleUrl: './calendar-component.scss'
})
export class CalendarComponent implements OnInit {
  private service = inject(CalendarService);
  private dialog = inject(Dialog);
  perm = inject(PermissionService);
  private toast = inject(ToastService);

  viewDate: Date = new Date();
  events: Evento[] = [];

  ngOnInit() {
    this.service.carregarEventos();
    this.service.calendar$.subscribe(lista => {
      this.events = lista.filter(e => e.isActive !== false);
    })
  }

  readonly CalendarPlus = CalendarPlus;
  readonly Calendar = Calendar;
  readonly ChevronLeft = ChevronLeft;
  readonly ChevronRight = ChevronRight;
  readonly Clock = Clock;

  CalendarView = CalendarView;
  selectedView: CalendarView = CalendarView.Month;
  view: CalendarView = CalendarView.Month;

  setView(value: CalendarView) {
    this.view = value;
  }

  get weekRange(): string {
    const start = startOfWeek(this.viewDate, { weekStartsOn: 0 }); // 0 = domingo, 1 = segunda
    const end = endOfWeek(this.viewDate, { weekStartsOn: 0 });
    const startStr = format(start, 'dd/MM/yyyy', { locale: ptBR });
    const endStr = format(end, 'dd/MM/yyyy', { locale: ptBR });
    return `${startStr} a ${endStr}`;
  }

  previousCalendarView() { //Anda com o calendario p tras
    if (this.view === CalendarView.Month) {
      this.viewDate = subMonths(this.viewDate, 1);
    } else if (this.view === CalendarView.Week) {
      this.viewDate = subWeeks(this.viewDate, 1);
    } else {
      this.viewDate = subDays(this.viewDate, 1);
    }
  }
  nextCalendarView() {//Anda com o calendario p frente
    if (this.view === CalendarView.Month) {
      this.viewDate = addMonths(this.viewDate, 1);
    } else if (this.view === CalendarView.Week) {
      this.viewDate = addWeeks(this.viewDate, 1);
    } else {
      this.viewDate = addDays(this.viewDate, 1);
    }
  }
  todayCalendarView() {//volta pra hj
    this.viewDate = new Date();
  }


  protected openModal() {
    this.service.eventoEmEdicao = undefined;
    const ref = this.dialog.open(AddEvent, { disableClose: true });

    ref.closed.subscribe((novoEvento) => {
      const evento = novoEvento as Evento | undefined;
      if (novoEvento) {

      }
    })
  }

  editarEvento({ event }: { event: Evento }) {
    if (!this.perm.can('agenda', 'edit')) {
      this.toast.show("Sem permissão para editar eventos");
      return;
    }
    if (!event) return;
    this.service.eventoEmEdicao = event;

    const ref = this.dialog.open(AddEvent, {});

    ref.closed.subscribe(
      this.service.eventoEmEdicao = undefined
    );
  }
}
