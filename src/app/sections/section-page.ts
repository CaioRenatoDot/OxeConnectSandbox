import { Component, computed, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { SECTIONS } from './sections';
import { SectionTabs } from './section-tabs';

// Página genérica de uma seção do menu, com uma aba para cada item do submenu.
// `section` e `tab` vêm do `data` da rota (withComponentInputBinding)
@Component({
  imports: [MatIconModule, SectionTabs],
  selector: 'app-section-page',
  styleUrl: './section-page.scss',
  templateUrl: './section-page.html',
})
export class SectionPage {
  readonly section = input.required<string>();
  readonly tab = input.required<string>();

  protected readonly current = computed(() => SECTIONS.find((s) => s.slug === this.section())!);
  protected readonly currentTab = computed(() => this.current().tabs.find((t) => t.slug === this.tab())!);
}
