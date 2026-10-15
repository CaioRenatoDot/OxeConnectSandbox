import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

interface MenuItem {
  label: string;
  icon: string;
  route?: string;
  children?: string[];
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
    {
      label: 'Vagas',
      icon: 'work',
      children: ['Todas as vagas', 'Nova vaga', 'Requisições de vaga', 'Banco de vagas'],
    },
    {
      label: 'Candidatos',
      icon: 'person_search',
      children: ['Banco de talentos', 'Triagem de currículos', 'Testes técnicos', 'Favoritos'],
    },
    {
      label: 'Processo seletivo',
      icon: 'view_kanban',
      children: ['Pipeline', 'Entrevistas', 'Feedbacks', 'Propostas', 'Contratações'],
    },
    {
      label: 'Relatórios',
      icon: 'bar_chart',
      children: ['Funil de recrutamento', 'Tempo de contratação', 'Origem dos candidatos'],
    },
    {
      label: 'Configurações',
      icon: 'settings',
      children: ['Recrutadores', 'Etapas do processo', 'Tecnologias e skills', 'Integrações'],
    },
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
