import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Toast {
  message: string;
  type: 'success' | 'danger' | 'info' | 'warning';
  duration?: number;
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private toastsSubject = new BehaviorSubject<Toast[]>([]);
  toasts$ = this.toastsSubject.asObservable();

  showToast(
    message: string,
    type: 'success' | 'danger' | 'info' | 'warning',
    duration = 3000
  ) {
    const newToast: Toast = { message, type, duration };
    this.toastsSubject.next([...this.toastsSubject.value, newToast]);

    setTimeout(() => {
      this.removeToast(newToast);
    }, duration);
  }

  private removeToast(toast: Toast) {
    this.toastsSubject.next(
      this.toastsSubject.value.filter((t) => t !== toast)
    );
  }
}
