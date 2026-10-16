import { Component, computed, inject, input, numberAttribute, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CountUp } from '../../count-up/count-up';
import { Dropdown } from '../../dropdown/dropdown';
import { Toast } from '../../toast/toast';
import { CandidateProfile } from '../candidate-profile/candidate-profile';
import { Candidate, Jobs, STAGES, STAGE_LABEL, STATUS_LABEL, Stage, Status } from '../jobs';

@Component({
  imports: [CurrencyPipe, DatePipe, RouterLink, MatIconModule, MatButtonModule, CountUp, Dropdown, CandidateProfile],
  selector: 'app-job-detail',
  styleUrl: './job-detail.scss',
  templateUrl: './job-detail.html',
})
export class JobDetail {
  private readonly jobs = inject(Jobs);
  private readonly toast = inject(Toast);

  // Vem direto do parâmetro da rota /vagas/:id (withComponentInputBinding)
  readonly id = input.required({ transform: numberAttribute });

  protected readonly companyName = signal('Minha Empresa');
  protected readonly stages = STAGES;

  protected readonly job = computed(() => this.jobs.find(this.id()));

  protected readonly candidates = computed(() => {
    const job = this.job();
    return job ? this.jobs.candidatesOf(job)() : [];
  });

  // Filtro de etapa da lista de candidatos
  protected readonly stageFilter = signal('');
  protected readonly visibleCandidates = computed(() =>
    this.candidates()
      .filter((c) => !this.stageFilter() || c.stage === this.stageFilter())
      .sort((a, b) => b.score - a.score),
  );

  // Candidato aberto no modal de análise da IA
  protected readonly selected = signal<Candidate | null>(null);

  // Quantidade de candidatos em cada etapa do funil
  protected readonly funnel = computed(() => {
    const list = this.candidates();
    const max = Math.max(1, list.length);
    return STAGES.map((stage) => {
      const count = list.filter((c) => c.stage === stage).length;
      return { stage, count, percent: (count / max) * 100 };
    });
  });

  protected readonly daysOpen = computed(() => {
    const job = this.job();
    if (!job) return 0;
    const diff = Date.now() - new Date(job.openedAt).getTime();
    return Math.max(0, Math.floor(diff / 86_400_000));
  });

  protected statusClass(status: Status): string {
    return STATUS_LABEL[status];
  }

  protected stageClass(stage: Stage): string {
    return STAGE_LABEL[stage];
  }

  protected initials(name: string): string {
    return name
      .split(' ')
      .slice(0, 2)
      .map((part) => part[0])
      .join('');
  }

  protected setStatus(status: Status): void {
    const job = this.job();
    if (!job) return;
    this.jobs.setStatus(job.id, status);
    this.toast.success(`Vaga marcada como "${status}"`);
  }

  protected move(candidate: Candidate, direction: 1 | -1): void {
    const job = this.job();
    if (!job) return;
    this.jobs.moveCandidate(job, candidate.id, direction);
    const stage = STAGES[STAGES.indexOf(candidate.stage) + direction];
    this.toast.info(`${candidate.name} movido para "${stage}"`);
  }

  // Link público da vaga (site de carreiras), o mesmo que é compartilhado com candidatos
  protected readonly publicUrl = computed(() => `${location.origin}/carreiras/vagas/${this.id()}`);

  protected copyLink(): void {
    navigator.clipboard?.writeText(this.publicUrl());
    this.toast.success('Link da vaga copiado');
  }
}
