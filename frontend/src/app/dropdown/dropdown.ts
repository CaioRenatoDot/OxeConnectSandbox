import { Component, input, model } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

// Dropdown do sistema: <app-dropdown placeholder="Situação" [options]="..." [(value)]="filtro" />
@Component({
  imports: [MatIconModule, MatMenuModule],
  selector: 'app-dropdown',
  styleUrl: './dropdown.scss',
  template: `
    <button
      type="button"
      class="trigger"
      [class.empty]="!value()"
      [matMenuTriggerFor]="menu"
      #trigger="matMenuTrigger"
      [class.open]="trigger.menuOpen"
    >
      <span>{{ value() || placeholder() }}</span>
      <mat-icon class="caret">expand_more</mat-icon>
    </button>

    <mat-menu #menu="matMenu">
      <button mat-menu-item (click)="value.set('')">Todos</button>
      @for (option of options(); track option) {
        <button mat-menu-item [class.selected]="option === value()" (click)="value.set(option)">
          {{ option }}
        </button>
      }
    </mat-menu>
  `,
})
export class Dropdown {
  readonly placeholder = input('Selecione');
  readonly options = input.required<readonly string[]>();
  readonly value = model('');
}
