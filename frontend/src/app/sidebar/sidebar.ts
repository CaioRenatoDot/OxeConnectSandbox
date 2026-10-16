import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

import { SECTIONS, tabLink } from '../sections/sections';

interface MenuItem {
  label: string;
  icon: string;
  route?: string;
  children?: { label: string; route: string }[];
}

@Component({
  imports: [RouterLink, RouterLinkActive, MatIconModule],
  host: { '[class.collapsed]': 'collapsed()' },
  selector: 'app-sidebar',
  styleUrl: './sidebar.scss',
  templateUrl: './sidebar.html',
})
export class Sidebar {
  protected readonly menu: MenuItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/' },
    ...SECTIONS.map((section) => ({
      label: section.label,
      icon: section.icon,
      children: section.tabs.map((tab) => ({ label: tab.label, route: tabLink(section, tab) })),
    })),
  ];

  protected readonly footer = [
    { label: 'Usuários', icon: 'person', danger: false },
    { label: 'Alteração de senha', icon: 'lock', danger: false },
    { label: 'Sair do sistema', icon: 'logout', danger: true },
  ];

  protected readonly expanded = signal<string | null>(null);

  protected readonly collapsed = signal(false);

  protected toggleCollapsed(): void {
    this.collapsed.update((value) => !value);
  }

  protected toggle(label: string): void {
    // Com a sidebar recolhida, clicar num grupo expande a sidebar e abre o grupo
    if (this.collapsed()) {
      this.collapsed.set(false);
      this.expanded.set(label);
      return;
    }
    this.expanded.update((current) => (current === label ? null : label));
  }
}
