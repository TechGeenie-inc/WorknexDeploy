import { CalendarEvent } from 'angular-calendar';
import { EventColor } from 'calendar-utils';
import { v4 as uuid } from 'uuid';

export class Evento implements CalendarEvent {
  id?: string | number;
  start!: Date;
  end?: Date;
  title!: string;
  color?: EventColor;
  allDay?: boolean = false;
  isActive?: boolean = true;
  equipeId?: string;

  static newEvento() {
    const evento = new Evento();
    evento.id = uuid();
    return evento;
  }
}
