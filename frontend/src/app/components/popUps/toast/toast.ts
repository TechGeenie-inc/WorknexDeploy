import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription, timer } from 'rxjs';
import { ToastMessage, ToastService } from '../../../services/toast-service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-toast',
  imports: [
    CommonModule,
  ],
  templateUrl: './toast.html',
  styleUrl: './toast.scss'
})
export class Toast implements OnInit, OnDestroy {

  toasts: ToastMessage[] = [];
  sub!: Subscription;

  fadeOutDuration = 250;

  constructor(private service: ToastService) { }

  ngOnInit() {
    this.sub = this.service.toastState.subscribe(toast => {
      toast._closing = false;
      this.toasts.push(toast);

      timer(toast.duration ?? 4000).subscribe(() => {
        this.startClose(toast.id!);
      });
    });
  }

  startClose(id: number) {
    const toast = this.toasts.find(t => t.id === id);
    if (!toast) return;

    toast._closing = true;

    setTimeout(() => {
      this.toasts = this.toasts.filter(t => t.id !== id);
    }, this.fadeOutDuration);
  }

  close(id: number) {
    this.startClose(id);
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

}
