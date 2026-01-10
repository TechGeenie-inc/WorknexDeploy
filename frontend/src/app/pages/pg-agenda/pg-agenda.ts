import { Component, inject } from '@angular/core';
import { Calendar, CalendarClock, ChartColumn, CircleCheckBig, FolderClock, Folders } from 'lucide-angular';
import { GanttChart, GanttTask } from '../../components/gantt-chart/gantt-chart';
import { CalendarComponent } from '../../components/month-calendar/calendar-component';
import { Equipe } from '../../components/popUps/add-equipe/equipe';
import { Evento } from '../../components/popUps/add-event/evento';
import { SegmentedControl } from '../../components/segmented-control/segmented-control';
import { SmallCardSection } from "../../components/small-card-section/small-card-section";
import { SmallCard } from '../../components/small-card/small-card';
import { CalendarService } from '../../services/calendar-service';
import { EquipeService } from '../../services/equipe-service';
import { Status } from '../../components/popUps/add-equipe/equipe';


@Component({
  selector: 'app-pg-agenda',
  imports: [SmallCard, SegmentedControl, SmallCardSection, CalendarComponent, GanttChart],
  templateUrl: './pg-agenda.html',
  styleUrl: './pg-agenda.scss'
})
export class PgAgenda {
  private serviceEquipes = inject(EquipeService);
  private serviceCalendar = inject(CalendarService);

  calendarioIsOpen: boolean = true;
  activeProjects: number = 0;
  sumProjects: number = 0;
  concludedProjects: number = 0;
  comingDeadlines: number = 0;

  readonly FolderClock = FolderClock;
  readonly Folders = Folders;
  readonly CircleCheckBig = CircleCheckBig;
  readonly CalendarClock = CalendarClock;
  readonly ChartColumn = ChartColumn;
  readonly Calendar = Calendar;

  ganttItems: GanttTask[] = [];

  onSelectionChange(index: number) {
    this.calendarioIsOpen = index === 0;
  }

  constructor() {
    this.serviceEquipes.equipe$.subscribe((lista: Equipe[]) => {
      const listaFiltrada = lista.filter(e => e.isActive !== false);
      this.sumProjects = listaFiltrada.length;
      this.activeProjects = listaFiltrada.filter((e => e.status === Status.EmAndamento)).length;
      this.concludedProjects = listaFiltrada.filter((e => e.status === Status.Concluido)).length;
    })
    this.serviceCalendar.calendar$.subscribe((lista: Evento[]) => {
      //this.ganttItems = lista;
      const today = new Date();
      const comingSevenDays = new Date();
      comingSevenDays.setDate(today.getDate() + 7);
      const listaFiltrada = lista.filter(e => e.isActive !== false && new Date(e.end || 0) <= comingSevenDays && new Date(e.end || 0) >= today)
      this.comingDeadlines = listaFiltrada.length;
    })
  }
}
