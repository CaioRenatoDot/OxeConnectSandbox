import { Injectable, signal } from '@angular/core';

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
  name: string;
  role: string;
  score: number;
  stage: Stage;
  appliedAt: string;
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

const NAMES = [
  'Lucas Almeida', 'Mariana Costa', 'Pedro Henrique', 'Juliana Ribeiro', 'Rafael Nunes',
  'Beatriz Santos', 'Gabriel Oliveira', 'Larissa Ferreira', 'Thiago Martins', 'Camila Rocha',
  'Felipe Araújo', 'Amanda Carvalho',
];
const ROLES = ['Desenvolvedor', 'Analista', 'Engenheiro', 'Consultor', 'Freelancer'];

@Injectable({ providedIn: 'root' })
export class Jobs {
  readonly all = signal<JobOpening[]>([
    { id: 1, title: 'Desenvolvedor Front-end Angular', stack: ['Angular', 'TypeScript', 'RxJS'], openedAt: '2026-09-02', seniority: 'Pleno', model: 'Remoto', candidates: 48, interviews: 6, salary: 9500, recruiter: 'Ana Souza', status: 'Em entrevistas' },
    { id: 2, title: 'Engenheiro de Dados', stack: ['Python', 'Spark', 'AWS'], openedAt: '2026-08-21', seniority: 'Sênior', model: 'Híbrido', candidates: 31, interviews: 4, salary: 15000, recruiter: 'Bruno Lima', status: 'Aberta' },
    { id: 3, title: 'Desenvolvedor Back-end Java', stack: ['Java', 'Spring Boot', 'Kafka'], openedAt: '2026-07-15', seniority: 'Sênior', model: 'Remoto', candidates: 62, interviews: 9, salary: 14000, recruiter: 'Ana Souza', status: 'Em entrevistas' },
    { id: 4, title: 'Analista de QA', stack: ['Cypress', 'Playwright'], openedAt: '2026-09-10', seniority: 'Júnior', model: 'Presencial', candidates: 85, interviews: 3, salary: 4500, recruiter: 'Carla Mendes', status: 'Aberta' },
    { id: 5, title: 'DevOps / SRE', stack: ['Kubernetes', 'Terraform', 'GCP'], openedAt: '2026-06-30', seniority: 'Especialista', model: 'Remoto', candidates: 19, interviews: 2, salary: 19000, recruiter: 'Bruno Lima', status: 'Pausada' },
    { id: 6, title: 'Desenvolvedor Mobile Flutter', stack: ['Flutter', 'Dart', 'Firebase'], openedAt: '2026-08-05', seniority: 'Pleno', model: 'Híbrido', candidates: 40, interviews: 5, salary: 8800, recruiter: 'Carla Mendes', status: 'Em entrevistas' },
    { id: 7, title: 'Cientista de Dados', stack: ['Python', 'PyTorch', 'SQL'], openedAt: '2026-05-12', seniority: 'Sênior', model: 'Remoto', candidates: 27, interviews: 0, salary: 16500, recruiter: 'Ana Souza', status: 'Encerrada' },
    { id: 8, title: 'Desenvolvedor Full Stack', stack: ['React', 'Node.js', 'PostgreSQL'], openedAt: '2026-09-18', seniority: 'Pleno', model: 'Remoto', candidates: 73, interviews: 7, salary: 10500, recruiter: 'Diego Rocha', status: 'Aberta' },
    { id: 9, title: 'Designer UX/UI', stack: ['Figma', 'Design System'], openedAt: '2026-09-25', seniority: 'Pleno', model: 'Híbrido', candidates: 56, interviews: 4, salary: 8000, recruiter: 'Diego Rocha', status: 'Em entrevistas' },
    { id: 10, title: 'Estagiário de Desenvolvimento', stack: ['JavaScript', 'Git'], openedAt: '2026-10-01', seniority: 'Júnior', model: 'Presencial', candidates: 140, interviews: 12, salary: 2000, recruiter: 'Carla Mendes', status: 'Aberta' },
  ]);

  // Candidatos de exemplo por vaga (gerados de forma determinística a partir do id)
  private readonly candidatesByJob = new Map<number, ReturnType<typeof signal<Candidate[]>>>();

  find(id: number): JobOpening | undefined {
    return this.all().find((job) => job.id === id);
  }

  setStatus(id: number, status: Status): void {
    this.all.update((jobs) => jobs.map((job) => (job.id === id ? { ...job, status } : job)));
  }

  candidatesOf(job: JobOpening) {
    let list = this.candidatesByJob.get(job.id);
    if (!list) {
      list = signal(this.generateCandidates(job));
      this.candidatesByJob.set(job.id, list);
    }
    return list;
  }

  moveCandidate(job: JobOpening, candidateId: number, direction: 1 | -1): void {
    this.candidatesOf(job).update((list) =>
      list.map((c) => {
        if (c.id !== candidateId) return c;
        const index = Math.min(Math.max(STAGES.indexOf(c.stage) + direction, 0), STAGES.length - 1);
        return { ...c, stage: STAGES[index] };
      }),
    );
  }

  private generateCandidates(job: JobOpening): Candidate[] {
    const count = Math.min(job.candidates, 10);
    return Array.from({ length: count }, (_, i) => {
      const seed = job.id * 7 + i * 13;
      const day = String(((seed * 3) % 27) + 1).padStart(2, '0');
      return {
        id: i + 1,
        name: NAMES[seed % NAMES.length],
        role: `${ROLES[seed % ROLES.length]} ${job.stack[i % job.stack.length]}`,
        score: 55 + ((seed * 17) % 45),
        stage: STAGES[(seed + i) % (job.status === 'Encerrada' ? STAGES.length : STAGES.length - 1)],
        appliedAt: `${job.openedAt.slice(0, 8)}${day}`,
      };
    });
  }
}
