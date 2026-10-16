import { Injectable, effect, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export type Status = 'Aberta' | 'Em entrevistas' | 'Pausada' | 'Encerrada';
export type Seniority = 'Júnior' | 'Pleno' | 'Sênior' | 'Especialista';
export type WorkModel = 'Remoto' | 'Híbrido' | 'Presencial';
export type Stage = 'Inscrito' | 'Triagem' | 'Teste técnico' | 'Entrevista' | 'Proposta' | 'Contratado';

export interface JobOpening {
  id: number;
  title: string;
  stack: string[];
  openedAt: string;
  seniority: Seniority;
  model: WorkModel;
  candidates: number;
  interviews: number;
  salary: number;
  recruiter: string;
  status: Status;
}

export interface Candidate {
  id: number;
  jobId?: number;
  jobTitle?: string;
  name: string;
  role: string;
  score: number;
  stage: Stage;
  appliedAt: string;
  favorite?: boolean;
}

export interface CandidateSkillDto {
  name: string;
  score: number;
}

export interface InterviewMessageDto {
  from: 'ai' | 'candidate';
  text: string;
  time: string;
  audio?: { seconds: number; waveform: number[] };
  evaluation?: { skill: string; score: number; note: string };
}

export interface CandidateProfileDto {
  skills: CandidateSkillDto[];
  messages: InterviewMessageDto[];
}

export const STATUSES: Status[] = ['Aberta', 'Em entrevistas', 'Pausada', 'Encerrada'];
export const SENIORITIES: Seniority[] = ['Júnior', 'Pleno', 'Sênior', 'Especialista'];
export const MODELS: WorkModel[] = ['Remoto', 'Híbrido', 'Presencial'];
export const STAGES: Stage[] = ['Inscrito', 'Triagem', 'Teste técnico', 'Entrevista', 'Proposta', 'Contratado'];

// Variante do label de cada situação (estilos globais .label em styles.scss)
export const STATUS_LABEL: Record<Status, string> = {
  Aberta: 'label-success',
  'Em entrevistas': 'label-info',
  Pausada: 'label-warning',
  Encerrada: 'label-neutral',
};

export const STAGE_LABEL: Record<Stage, string> = {
  Inscrito: 'label-neutral',
  Triagem: 'label-warning',
  'Teste técnico': 'label-warning',
  Entrevista: 'label-info',
  Proposta: 'label-info',
  Contratado: 'label-success',
};

@Injectable({ providedIn: 'root' })
export class Jobs {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8080/api/jobs';

  readonly all = signal<JobOpening[]>([]);
  readonly allCandidates = signal<Candidate[]>([]);

  private readonly candidatesByJob = new Map<number, ReturnType<typeof signal<Candidate[]>>>();
  private readonly profilesByCandidate = new Map<string, ReturnType<typeof signal<CandidateProfileDto | null>>>();

  constructor() {
    this.loadJobs();
    this.loadAllCandidates();
  }

  loadJobs(): void {
    this.http.get<JobOpening[]>(this.apiUrl).subscribe({
      next: (jobs) => this.all.set(jobs),
      error: (err) => console.error('Erro ao carregar vagas do backend:', err),
    });
  }

  loadAllCandidates(): void {
    this.http.get<Candidate[]>(`${this.apiUrl}/candidates`).subscribe({
      next: (candidates) => this.allCandidates.set(candidates),
      error: (err) => console.error('Erro ao carregar banco de talentos:', err),
    });
  }

  find(id: number): JobOpening | undefined {
    return this.all().find((job) => job.id === id);
  }

  /** Cadastra uma vaga nova (aberta, sem candidatos) no topo da lista e persiste no backend. */
  create(data: Pick<JobOpening, 'title' | 'stack' | 'seniority' | 'model' | 'salary' | 'recruiter'>): JobOpening {
    const tempId = Math.max(0, ...this.all().map((j) => j.id)) + 1;
    const optimisticJob: JobOpening = {
      ...data,
      id: tempId,
      openedAt: new Date().toISOString().slice(0, 10),
      candidates: 0,
      interviews: 0,
      status: 'Aberta',
    };
    this.all.update((jobs) => [optimisticJob, ...jobs]);

    this.http
      .post<JobOpening>(this.apiUrl, {
        ...data,
        status: 'Aberta',
      })
      .subscribe({
        next: (created) => {
          this.all.update((jobs) => jobs.map((j) => (j.id === tempId ? created : j)));
        },
        error: (err) => {
          console.error('Erro ao criar vaga no backend:', err);
          this.loadJobs();
        },
      });

    return optimisticJob;
  }

  setStatus(id: number, status: Status): void {
    this.all.update((jobs) => jobs.map((job) => (job.id === id ? { ...job, status } : job)));
    this.http.patch<JobOpening>(`${this.apiUrl}/${id}/status`, { status }).subscribe({
      next: (updated) => {
        this.all.update((jobs) => jobs.map((job) => (job.id === id ? updated : job)));
      },
      error: (err) => {
        console.error('Erro ao atualizar status da vaga:', err);
        this.loadJobs();
      },
    });
  }

  candidatesOf(job: JobOpening) {
    let list = this.candidatesByJob.get(job.id);
    if (!list) {
      list = signal<Candidate[]>([]);
      this.candidatesByJob.set(job.id, list);
      this.loadCandidates(job.id);
    }
    return list;
  }

  loadCandidates(jobId: number): void {
    this.http.get<Candidate[]>(`${this.apiUrl}/${jobId}/candidates`).subscribe({
      next: (candidates) => {
        let list = this.candidatesByJob.get(jobId);
        if (!list) {
          list = signal<Candidate[]>(candidates);
          this.candidatesByJob.set(jobId, list);
        } else {
          list.set(candidates);
        }
      },
      error: (err) => console.error(`Erro ao carregar candidatos da vaga ${jobId}:`, err),
    });
  }

  profileOf(jobId: number, candidateId: number) {
    const key = `${jobId}:${candidateId}`;
    let profileSig = this.profilesByCandidate.get(key);
    if (!profileSig) {
      profileSig = signal<CandidateProfileDto | null>(null);
      this.profilesByCandidate.set(key, profileSig);
      this.http
        .get<CandidateProfileDto>(`${this.apiUrl}/${jobId}/candidates/${candidateId}/profile`)
        .subscribe({
          next: (profile) => profileSig!.set(profile),
          error: (err) => console.error(`Erro ao carregar perfil do candidato ${candidateId}:`, err),
        });
    }
    return profileSig;
  }

  toggleFavorite(candidate: Candidate): void {
    const jobId = candidate.jobId;
    if (!jobId) return;

    const nextFav = !candidate.favorite;
    this.allCandidates.update((list) =>
      list.map((c) => (c.id === candidate.id ? { ...c, favorite: nextFav } : c)),
    );
    const jobList = this.candidatesByJob.get(jobId);
    if (jobList) {
      jobList.update((list) =>
        list.map((c) => (c.id === candidate.id ? { ...c, favorite: nextFav } : c)),
      );
    }

    this.http
      .patch<Candidate>(`${this.apiUrl}/${jobId}/candidates/${candidate.id}/favorite`, {})
      .subscribe({
        next: (updated) => {
          this.allCandidates.update((list) =>
            list.map((c) => (c.id === candidate.id ? updated : c)),
          );
          if (jobList) {
            jobList.update((list) => list.map((c) => (c.id === candidate.id ? updated : c)));
          }
        },
        error: (err) => console.error('Erro ao favoritar candidato:', err),
      });
  }

  moveCandidate(job: JobOpening, candidateId: number, direction: 1 | -1): void {
    this.candidatesOf(job).update((list) =>
      list.map((c) => {
        if (c.id !== candidateId) return c;
        const index = Math.min(Math.max(STAGES.indexOf(c.stage) + direction, 0), STAGES.length - 1);
        return { ...c, stage: STAGES[index] };
      }),
    );

    this.http
      .patch<Candidate>(`${this.apiUrl}/${job.id}/candidates/${candidateId}/stage`, { direction })
      .subscribe({
        next: (updated) => {
          this.candidatesOf(job).update((list) =>
            list.map((c) => (c.id === candidateId ? updated : c)),
          );
          this.allCandidates.update((list) =>
            list.map((c) => (c.id === candidateId ? updated : c)),
          );
          if (updated.stage === 'Entrevista') {
            this.loadJobs();
          }
        },
        error: (err) => {
          console.error('Erro ao mover candidato de etapa:', err);
          this.loadCandidates(job.id);
        },
      });
  }

  /** Registra uma candidatura enviada pela página pública da vaga (/carreiras/vagas/:id). */
  apply(job: JobOpening, applicant?: { name: string; role: string }): void {
    const mainTech = job.stack[0] ?? 'Software';
    const name = applicant?.name?.trim() || 'Novo Candidato';
    const role = applicant?.role?.trim() || `Desenvolvedor ${mainTech}`;

    this.http
      .post<Candidate>(`${this.apiUrl}/${job.id}/candidates`, {
        name,
        role,
        stage: 'Inscrito',
      })
      .subscribe({
        next: (created) => {
          this.all.update((jobs) =>
            jobs.map((j) => (j.id === job.id ? { ...j, candidates: j.candidates + 1 } : j)),
          );
          const list = this.candidatesByJob.get(job.id);
          if (list) {
            list.update((items) => [created, ...items]);
          }
          this.allCandidates.update((items) => [created, ...items]);
        },
        error: (err) => console.error('Erro ao enviar candidatura:', err),
      });
  }
}
