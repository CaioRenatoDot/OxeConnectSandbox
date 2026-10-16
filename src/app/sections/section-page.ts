import { Component, computed, inject, input, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { SECTIONS } from './sections';
import { SectionTabs } from './section-tabs';
import {
  Candidate,
  JobOpening,
  Jobs,
  MODELS,
  SENIORITIES,
  STAGES,
  STAGE_LABEL,
  STATUS_LABEL,
  Stage,
  Status,
} from '../jobs/jobs';
import { NewJobDialog } from '../jobs/new-job-dialog/new-job-dialog';
import { CandidateProfile } from '../jobs/candidate-profile/candidate-profile';
import { Toast } from '../toast/toast';

@Component({
  imports: [
    CurrencyPipe,
    DatePipe,
    RouterLink,
    MatIconModule,
    MatButtonModule,
    SectionTabs,
    CandidateProfile,
  ],
  selector: 'app-section-page',
  styleUrl: './section-page.scss',
  templateUrl: './section-page.html',
})
export class SectionPage {
  private readonly jobsService = inject(Jobs);
  private readonly dialog = inject(MatDialog);
  private readonly toast = inject(Toast);

  readonly section = input.required<string>();
  readonly tab = input.required<string>();

  protected readonly stages = STAGES;
  protected readonly jobs = this.jobsService.all;
  protected readonly allCandidates = this.jobsService.allCandidates;

  protected readonly search = signal('');
  protected readonly selectedCandidate = signal<Candidate | null>(null);
  protected readonly selectedCandidateJob = computed<JobOpening | undefined>(() => {
    const c = this.selectedCandidate();
    if (!c) return undefined;
    return this.jobsService.find(c.jobId ?? 1) ?? this.jobs()[0];
  });

  protected readonly current = computed(() => SECTIONS.find((s) => s.slug === this.section())!);
  protected readonly currentTab = computed(() => this.current().tabs.find((t) => t.slug === this.tab())!);

  // Candidatos filtrados conforme a seção/aba ativa e busca textual
  protected readonly filteredCandidates = computed(() => {
    const term = this.search().trim().toLowerCase();
    const sec = this.section();
    const t = this.tab();

    return this.allCandidates().filter((c) => {
      const matchesTerm =
        !term ||
        c.name.toLowerCase().includes(term) ||
        c.role.toLowerCase().includes(term) ||
        (c.jobTitle?.toLowerCase().includes(term) ?? false);
      if (!matchesTerm) return false;

      if (sec === 'candidatos') {
        if (t === 'triagem') return c.stage === 'Inscrito' || c.stage === 'Triagem';
        if (t === 'testes') return c.stage === 'Teste técnico';
        if (t === 'favoritos') return !!c.favorite;
        return true;
      }

      if (sec === 'processo') {
        if (t === 'entrevistas') return c.stage === 'Entrevista';
        if (t === 'feedbacks') return c.score >= 75;
        if (t === 'propostas') return c.stage === 'Proposta';
        if (t === 'contratacoes') return c.stage === 'Contratado';
      }

      return true;
    });
  });

  // Colunas do Kanban para /processo/pipeline
  protected readonly kanbanColumns = computed(() => {
    const all = this.allCandidates();
    return STAGES.map((stage) => ({
      stage,
      items: all.filter((c) => c.stage === stage).slice(0, 12),
      total: all.filter((c) => c.stage === stage).length,
    }));
  });

  // Funil consolidado para /relatorios/funil
  protected readonly globalFunnel = computed(() => {
    const all = this.allCandidates();
    const max = Math.max(1, all.length);
    return STAGES.map((stage) => {
      const count = all.filter((c) => c.stage === stage).length;
      return { stage, count, percent: Math.round((count / max) * 100) };
    });
  });

  // Distribuição por modelo e senioridade para /relatorios/origem
  protected readonly modelBreakdown = computed(() => {
    const jobs = this.jobs();
    return MODELS.map((model) => {
      const matching = jobs.filter((j) => j.model === model);
      const candidates = matching.reduce((sum, j) => sum + j.candidates, 0);
      return { label: model, jobs: matching.length, candidates };
    });
  });

  protected readonly seniorityBreakdown = computed(() => {
    const jobs = this.jobs();
    return SENIORITIES.map((seniority) => {
      const matching = jobs.filter((j) => j.seniority === seniority);
      const candidates = matching.reduce((sum, j) => sum + j.candidates, 0);
      return { label: seniority, jobs: matching.length, candidates };
    });
  });

  // Recrutadores agregados para /configuracoes/recrutadores
  protected readonly recruiters = computed(() => {
    const map = new Map<string, { name: string; jobs: number; candidates: number }>();
    for (const job of this.jobs()) {
      const curr = map.get(job.recruiter) ?? { name: job.recruiter, jobs: 0, candidates: 0 };
      curr.jobs += 1;
      curr.candidates += job.candidates;
      map.set(job.recruiter, curr);
    }
    return Array.from(map.values());
  });

  // Catálogo de tecnologias para /configuracoes/skills
  protected readonly skillsCatalog = computed(() => {
    const map = new Map<string, number>();
    for (const job of this.jobs()) {
      for (const tech of job.stack) {
        map.set(tech, (map.get(tech) ?? 0) + 1);
      }
    }
    return Array.from(map.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  });

  protected readonly integrations = signal([
    { name: 'LinkedIn Recruiter', icon: 'work', description: 'Publicação automática de vagas e importação de perfis.', connected: true },
    { name: 'GitHub', icon: 'code', description: 'Análise de repositórios para testes técnicos.', connected: true },
    { name: 'Google Calendar & Meet', icon: 'event', description: 'Agendamento automático de entrevistas com candidatos.', connected: true },
    { name: 'Slack', icon: 'forum', description: 'Notificações de avanço de etapa para recrutadores.', connected: false },
  ]);

  protected openNewJobDialog(): void {
    this.dialog
      .open(NewJobDialog, { width: '560px', maxWidth: 'calc(100vw - 32px)', autoFocus: 'first-tabbable' })
      .afterClosed()
      .subscribe((job) => job && this.toast.success(`Vaga "${job.title}" criada com sucesso`));
  }

  protected cloneJob(job: JobOpening): void {
    const created = this.jobsService.create({
      title: `${job.title} (Nova abertura)`,
      stack: [...job.stack],
      seniority: job.seniority,
      model: job.model,
      salary: job.salary,
      recruiter: job.recruiter,
    });
    this.toast.success(`Vaga "${created.title}" aberta a partir do modelo`);
  }

  protected toggleFavorite(candidate: Candidate, event: Event): void {
    event.stopPropagation();
    this.jobsService.toggleFavorite(candidate);
  }

  protected moveCandidate(candidate: Candidate, direction: 1 | -1, event?: Event): void {
    event?.stopPropagation();
    const job = this.jobsService.find(candidate.jobId ?? 1);
    if (!job) return;
    this.jobsService.moveCandidate(job, candidate.id, direction);
    const nextStage = STAGES[STAGES.indexOf(candidate.stage) + direction];
    this.toast.info(`${candidate.name} movido para "${nextStage}"`);
  }

  protected toggleIntegration(index: number): void {
    this.integrations.update((list) =>
      list.map((item, i) => (i === index ? { ...item, connected: !item.connected } : item)),
    );
  }

  protected daysOpen(openedAt: string): number {
    const diff = Date.now() - new Date(openedAt).getTime();
    return Math.max(0, Math.floor(diff / 86_400_000));
  }

  protected initials(name: string): string {
    return name
      .split(' ')
      .slice(0, 2)
      .map((part) => part[0])
      .join('');
  }

  protected statusClass(status: Status): string {
    return STATUS_LABEL[status];
  }

  protected stageClass(stage: Stage): string {
    return STAGE_LABEL[stage];
  }

  protected value(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }
}
