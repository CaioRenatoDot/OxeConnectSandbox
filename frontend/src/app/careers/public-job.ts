import { Component, computed, inject, input, numberAttribute, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Toast } from '../toast/toast';
import { JobOpening, Jobs } from '../jobs/jobs';

// Página pública da vaga (estilo site de carreiras), aberta fora do layout administrativo
@Component({
  imports: [CurrencyPipe, DatePipe, FormsModule, MatButtonModule, MatIconModule],
  selector: 'app-public-job',
  styleUrl: './public-job.scss',
  templateUrl: './public-job.html',
})
export class PublicJob {
  readonly id = input.required({ transform: numberAttribute });

  private readonly toast = inject(Toast);
  private readonly jobs = inject(Jobs);

  // Empresa contratante. Futuramente virá da configuração da conta.
  protected readonly companyName = 'Minha Empresa';

  protected readonly job = computed(() => this.jobs.find(this.id()));
  protected readonly accepting = computed(() => {
    const status = this.job()?.status;
    return status === 'Aberta' || status === 'Em entrevistas';
  });
  protected readonly applied = signal(false);

  // Campos do formulário de candidatura
  protected readonly applicantName = signal('');
  protected readonly applicantRole = signal('');

  // Texto de exemplo montado a partir dos dados da vaga
  protected readonly responsibilities = computed(() => {
    const job = this.job();
    if (!job) return [];
    return [
      `Desenvolver e manter soluções utilizando ${job.stack.slice(0, 2).join(' e ')}`,
      'Participar das cerimônias do time e das decisões técnicas',
      'Colaborar com produto e design na evolução das funcionalidades',
      'Escrever código limpo, testado e bem documentado',
    ];
  });

  protected readonly requirements = computed(() => {
    const job = this.job();
    if (!job) return [];
    return [
      ...job.stack.map((tech) => `Experiência com ${tech}`),
      `Vivência compatível com o nível ${job.seniority.toLowerCase()}`,
      'Boa comunicação e trabalho em equipe',
    ];
  });

  protected readonly benefits = [
    { icon: 'health_and_safety', label: 'Plano de saúde e odontológico' },
    { icon: 'restaurant', label: 'Vale refeição / alimentação' },
    { icon: 'school', label: 'Auxílio educação' },
    { icon: 'schedule', label: 'Horário flexível' },
    { icon: 'computer', label: 'Equipamento fornecido' },
    { icon: 'celebration', label: 'Day off no aniversário' },
  ];

  protected apply(job: JobOpening): void {
    const name = this.applicantName().trim();
    if (!name) {
      this.toast.warning('Informe seu nome para enviar a candidatura');
      return;
    }
    const role = this.applicantRole().trim() || `Desenvolvedor ${job.stack[0] ?? 'Software'}`;
    this.jobs.apply(job, { name, role });
    this.applied.set(true);
    this.toast.success(`Candidatura de ${name} para "${job.title}" enviada!`);
  }
}
