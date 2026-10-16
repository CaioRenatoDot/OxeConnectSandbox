import { Component, DestroyRef, computed, inject, input, output, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Candidate, JobOpening, Jobs } from '../jobs';

interface Skill {
  name: string;
  score: number;
}

interface Message {
  from: 'ai' | 'candidate';
  text: string;
  time: Date;
  // Respostas do candidato são áudios; `text` é a transcrição
  audio?: { seconds: number; waveform: number[] };
  // Avaliação da IA sobre a resposta (só em mensagens do candidato)
  evaluation?: { skill: string; score: number; note: string };
}

// Barras da forma de onda, geradas a partir de uma semente (fallback local)
function waveform(seed: number): number[] {
  return Array.from({ length: 32 }, (_, i) => 25 + ((seed * 37 + i * 53 + ((i * i) % 7) * 11) % 75));
}

// Cada pergunta tem 3 respostas possíveis: forte, intermediária e fraca
const INTERVIEW = [
  {
    question: (s: string) => `Conte um projeto recente em que você usou ${s}. Qual foi o maior desafio?`,
    answers: [
      (s: string) => `Usei ${s} num sistema de pagamentos com milhares de transações por minuto. O maior desafio foi performance; resolvi com paginação no servidor e cache.`,
      (s: string) => `Usei ${s} num painel administrativo interno. O desafio foi organizar o código conforme o projeto crescia.`,
      (s: string) => `Usei ${s} em um projeto pessoal pequeno, ainda não peguei nada muito complexo.`,
    ],
  },
  {
    question: (s: string) => `Como você organiza e testa um código com ${s} em produção?`,
    answers: [
      (s: string) => `Separo em camadas com responsabilidades claras, escrevo testes unitários para regras de negócio e testes E2E nos fluxos críticos com ${s}.`,
      (s: string) => `Tento separar bem os módulos e faço alguns testes unitários nas partes mais importantes.`,
      (s: string) => `Normalmente testo manualmente antes de subir, ainda não tenho muita prática com testes automatizados.`,
    ],
  },
  {
    question: (s: string) => `Que boas práticas de ${s} você considera essenciais?`,
    answers: [
      (s: string) => `Tipagem forte, funções pequenas e puras, evitar estado compartilhado e seguir o guia de estilo oficial de ${s}.`,
      (s: string) => `Manter o código legível, dar bons nomes e evitar duplicação.`,
      (s: string) => `Acho que comentar bem o código é o mais importante.`,
    ],
  },
];

const NOTES = ['Resposta sólida, com exemplos concretos.', 'Resposta adequada, mas pouco aprofundada.', 'Resposta superficial; vale investigar na entrevista.'];
const SOFT_SKILLS = ['Comunicação', 'Resolução de problemas'];

@Component({
  imports: [DatePipe, MatIconModule],
  selector: 'app-candidate-profile',
  styleUrl: './candidate-profile.scss',
  templateUrl: './candidate-profile.html',
  host: { '(document:keydown.escape)': 'close()' },
})
export class CandidateProfile {
  private readonly jobs = inject(Jobs);

  readonly candidate = input.required<Candidate>();
  readonly job = input.required<JobOpening>();
  readonly closed = output<void>();

  protected readonly chatOpen = signal(false);

  // Perfil persistido no backend PostgreSQL (/api/jobs/:jobId/candidates/:candidateId/profile)
  private readonly backendProfile = computed(() =>
    this.jobs.profileOf(this.job().id, this.candidate().id)(),
  );

  // Pontuação de cada skill vinda do backend (com fallback imediato enquanto carrega)
  protected readonly skills = computed<Skill[]>(() => {
    const persisted = this.backendProfile();
    if (persisted?.skills?.length) {
      return persisted.skills;
    }
    const { id, score } = this.candidate();
    return [...this.job().stack, ...SOFT_SKILLS].map((name, i) => {
      const variation = ((id * 31 + i * 17) % 21) - 10;
      return { name, score: Math.min(100, Math.max(30, score + variation)) };
    });
  });

  protected readonly chat = computed<Message[]>(() => {
    const persisted = this.backendProfile();
    if (persisted?.messages?.length) {
      return persisted.messages.map((m) => ({
        ...m,
        time: new Date(m.time),
      }));
    }

    const { name, id, appliedAt } = this.candidate();
    const firstName = name.split(' ')[0];
    const time = new Date(`${appliedAt}T14:00:00`);
    const at = (minutes: number) => new Date(time.getTime() + minutes * 60_000);

    const messages: Message[] = [
      { from: 'ai', time: at(0), text: `Olá, ${firstName}! Sou a assistente de triagem. Vou fazer algumas perguntas técnicas sobre a vaga de ${this.job().title}.` },
    ];
    this.skills()
      .slice(0, this.job().stack.length)
      .forEach((skill, i) => {
        const step = INTERVIEW[(id + i) % INTERVIEW.length];
        const quality = skill.score >= 80 ? 0 : skill.score >= 65 ? 1 : 2;
        messages.push(
          { from: 'ai', time: at(i * 3 + 1), text: step.question(skill.name) },
          {
            from: 'candidate',
            time: at(i * 3 + 2),
            text: step.answers[quality](skill.name),
            audio: { seconds: 12 + ((id * 7 + i * 19) % 40), waveform: waveform(id + i) },
            evaluation: { skill: skill.name, score: skill.score, note: NOTES[quality] },
          },
        );
      });
    messages.push({
      from: 'ai',
      time: at(this.job().stack.length * 3 + 1),
      text: `Obrigado, ${firstName}! Sua análise foi concluída e enviada ao recrutador.`,
    });
    return messages;
  });

  protected readonly duration = computed(() => {
    const chat = this.chat();
    return Math.round((chat[chat.length - 1].time.getTime() - chat[0].time.getTime()) / 60_000);
  });

  protected readonly answers = computed(() => this.chat().filter((m) => m.from === 'candidate').length);

  protected readonly summary = computed(() => {
    const sorted = [...this.skills()].sort((a, b) => b.score - a.score);
    return { best: sorted[0], worst: sorted[sorted.length - 1] };
  });

  protected level(score: number): string {
    return score >= 80 ? 'high' : score >= 65 ? 'medium' : 'low';
  }

  // Reprodução simulada do áudio: índice da mensagem e segundos tocados
  protected readonly playing = signal<{ index: number; elapsed: number } | null>(null);
  private timer?: ReturnType<typeof setInterval>;

  constructor() {
    inject(DestroyRef).onDestroy(() => clearInterval(this.timer));
  }

  protected togglePlay(index: number, seconds: number): void {
    clearInterval(this.timer);
    if (this.playing()?.index === index) {
      this.playing.set(null);
      return;
    }
    this.playing.set({ index, elapsed: 0 });
    this.timer = setInterval(() => {
      const current = this.playing();
      if (!current || current.elapsed + 0.25 >= seconds) {
        clearInterval(this.timer);
        this.playing.set(null);
      } else {
        this.playing.set({ index, elapsed: current.elapsed + 0.25 });
      }
    }, 250);
  }

  // Fração já tocada (0–1) da mensagem
  protected progress(index: number, seconds: number): number {
    const current = this.playing();
    return current?.index === index ? current.elapsed / seconds : 0;
  }

  protected formatTime(seconds: number): string {
    const s = Math.floor(seconds);
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  }

  protected close(): void {
    if (this.chatOpen()) this.chatOpen.set(false);
    else this.closed.emit();
  }

  // Respostas avaliadas, com a posição no chat para navegação da auditoria
  protected readonly evaluations = computed(() =>
    this.chat().flatMap((m, index) => (m.evaluation ? [{ ...m.evaluation, index }] : [])),
  );

  protected scrollTo(index: number): void {
    document.getElementById(`msg-${index}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}
