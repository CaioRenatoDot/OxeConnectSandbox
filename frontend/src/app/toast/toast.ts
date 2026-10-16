import { Component, Injectable, inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA, MatSnackBar, MatSnackBarRef } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastData {
  message: string;
  type: ToastType;
}

const ICONS: Record<ToastType, string> = {
  success: 'check_circle',
  error: 'error',
  warning: 'warning',
  info: 'info',
};

// Componente visual do toast (renderizado dentro do MatSnackBar)
@Component({
  imports: [MatIconModule],
  selector: 'app-toast',
  styleUrl: './toast.scss',
  template: `
    <mat-icon class="icon" [class]="data.type">{{ icon }}</mat-icon>
    <span class="message">{{ data.message }}</span>
    <button type="button" class="close" (click)="ref.dismiss()">Fechar</button>
  `,
})
export class ToastComponent {
  protected readonly data = inject<ToastData>(MAT_SNACK_BAR_DATA);
  protected readonly ref = inject(MatSnackBarRef);
  protected readonly icon = ICONS[this.data.type];
}

// Serviço para disparar toasts de qualquer lugar: inject(Toast).error('...')
@Injectable({ providedIn: 'root' })
export class Toast {
  private readonly snackBar = inject(MatSnackBar);

  success(message: string): void {
    this.show(message, 'success');
  }

  error(message: string): void {
    this.show(message, 'error');
  }

  warning(message: string): void {
    this.show(message, 'warning');
  }

  info(message: string): void {
    this.show(message, 'info');
  }

  private show(message: string, type: ToastType): void {
    this.snackBar.openFromComponent(ToastComponent, {
      data: { message, type },
      duration: 4000,
      panelClass: 'app-toast-panel',
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
  }
}
