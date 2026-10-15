import { Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CdkConnectedOverlay, CdkOverlayOrigin, ConnectedPosition } from '@angular/cdk/overlay';
import { Toast } from '../toast/toast';
import { Dropdown } from '../dropdown/dropdown';
import { CountUp } from '../count-up/count-up';
import { Router } from '@angular/router';
import { Jobs, MODELS, SENIORITIES, STATUSES, STATUS_LABEL, Status } from '../jobs/jobs';

@Component({
  imports: [CurrencyPipe, DatePipe, MatIconModule, MatButtonModule, CdkConnectedOverlay, CdkOverlayOrigin, Dropdown, CountUp],
  selector: 'app-dashboard',
  styleUrl: './dashboard.scss',
  templateUrl: './dashboard.html',
})
export class Dashboard {
  protected readonly toast = inject(Toast);

  // Empresa contratante (exibida no breadcrumb). Futuramente virá do usuário logado.
  protected readonly companyName = signal('Minha Empresa');

  // Menu "Ações": abre centralizado logo abaixo do botão
  protected readonly actionsOpen = signal(false);
  protected readonly centeredBelow: ConnectedPosition[] = [
    { originX: 'center', originY: 'bottom', overlayX: 'center', overlayY: 'top', offsetY: 8 },
  ];
  protected readonly actions = [
    { label: 'Importar vagas', run: () => this.toast.success('Vagas importadas com sucesso') },
    { label: 'Exportar relatório', run: () => this.toast.info('Relatório sendo gerado...') },
    { label: 'Enviar convites', run: () => this.toast.warning('Nenhum candidato selecionado') },
    { label: 'Criar usuário', run: () => this.toast.error('Erro ao criar usuário') },
  ];

  protected runAction(run: () => void): void {
    this.actionsOpen.set(false);
    run();
  }

  private readonly router = inject(Router);
  protected readonly jobs = inject(Jobs).all;

  protected readonly statuses = STATUSES;
  protected readonly seniorities = SENIORITIES;
  protected readonly models = MODELS;

  // Filtros
  protected readonly search = signal('');
  protected readonly status = signal('');
  protected readonly seniority = signal('');
  protected readonly model = signal('');

  protected readonly filtered = computed(() => {
    const term = this.search().trim().toLowerCase();
    return this.jobs().filter(
      (job) =>
        (!term || job.title.toLowerCase().includes(term) || job.stack.some((s) => s.toLowerCase().includes(term))) &&
        (!this.status() || job.status === this.status()) &&
        (!this.seniority() || job.seniority === this.seniority()) &&
        (!this.model() || job.model === this.model()),
    );
  });

  // Filtros aplicados, exibidos como tags removíveis
  protected readonly activeFilters = computed(() =>
    [
      { label: this.search().trim() && `"${this.search().trim()}"`, clear: () => this.search.set('') },
      { label: this.status(), clear: () => this.status.set('') },
      { label: this.seniority(), clear: () => this.seniority.set('') },
      { label: this.model(), clear: () => this.model.set('') },
    ].filter((filter) => filter.label),
  );

  protected clearFilters(): void {
    for (const filter of this.activeFilters()) filter.clear();
  }

  // Indicadores do topo
  protected readonly stats = computed(() => {
    const jobs = this.jobs();
    const active = jobs.filter((j) => j.status === 'Aberta' || j.status === 'Em entrevistas');
    return [
      { label: 'Vagas ativas', value: active.length, icon: 'work' },
      { label: 'Candidatos', value: jobs.reduce((sum, j) => sum + j.candidates, 0), icon: 'groups' },
      { label: 'Entrevistas', value: jobs.reduce((sum, j) => sum + j.interviews, 0), icon: 'event' },
      { label: 'Encerradas', value: jobs.filter((j) => j.status === 'Encerrada').length, icon: 'task_alt' },
    ];
  });

  protected statusClass(status: Status): string {
    return STATUS_LABEL[status];
  }

  protected openJob(id: number): void {
    this.router.navigate(['/vagas', id]);
  }

  protected value(event: Event): string {
    return (event.target as HTMLInputElement | HTMLSelectElement).value;
  }
}
