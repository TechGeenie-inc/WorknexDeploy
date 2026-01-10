import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface ToastMessage {
  id?: number;
  text: string;
  duration?: number; // ms
  _closing?: boolean;
  _entering?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  private toastSubject = new Subject<ToastMessage>();
  toastState = this.toastSubject.asObservable();

  show(text: string, duration: number = 3500) {
    this.toastSubject.next({
      id: Date.now(),
      text,
      duration
    });
  }

}
