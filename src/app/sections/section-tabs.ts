import { Component, computed, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { SECTIONS, tabLink } from './sections';

// Barra de abas de uma seção do menu lateral
@Component({
  imports: [RouterLink, RouterLinkActive, MatIconModule],
  selector: 'app-section-tabs',
  host: { role: 'tablist' },
  template: `
    @for (item of current().tabs; track item.slug) {
      <a
        role="tab"
        [routerLink]="tabLink(current(), item)"
        routerLinkActive="active"
        [routerLinkActiveOptions]="{ exact: true }"
        #rla="routerLinkActive"
        [attr.aria-selected]="rla.isActive"
      >
        <mat-icon>{{ item.icon }}</mat-icon>
        {{ item.label }}
        @if (rla.isActive) {
          <span class="indicator"></span>
        }
      </a>
    }
  `,
  styles: `
    @use 'tokens' as t;

    :host {
      display: flex;
      gap: 4px;
      margin-bottom: 20px;
      border-bottom: 1px solid t.$neutral-200;
      overflow-x: auto;
      scrollbar-width: none;
      // Grupo próprio na view transition: a barra fica parada enquanto a página anima
      view-transition-name: section-tabs;
    }

    a {
      position: relative;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      color: t.$neutral-400;
      font-size: 14px;
      font-weight: 600;
      white-space: nowrap;
      text-decoration: none;
      transition: color 0.2s ease, border-color 0.2s ease;

      &:hover {
        color: t.$neutral-600;
      }

      &.active {
        color: t.$action-500;
      }
    }

    // Sublinhado da aba ativa; o nome de transição faz ele deslizar entre as abas
    .indicator {
      position: absolute;
      right: 0;
      bottom: 0;
      left: 0;
      height: 2px;
      border-radius: 2px 2px 0 0;
      background: t.$action-500;
      view-transition-name: tab-indicator;
    }

    mat-icon {
      width: 18px;
      height: 18px;
      font-size: 18px;
    }
  `,
})
export class SectionTabs {
  readonly section = input.required<string>();

  protected readonly tabLink = tabLink;
  protected readonly current = computed(() => SECTIONS.find((s) => s.slug === this.section())!);
}
