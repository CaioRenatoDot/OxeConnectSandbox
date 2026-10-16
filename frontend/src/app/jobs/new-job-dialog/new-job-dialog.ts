import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { JobOpening, Jobs, MODELS, SENIORITIES } from '../jobs';

// Modal de cadastro de vaga; fecha devolvendo a vaga criada (ou undefined se cancelar)
@Component({
  imports: [ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatIconModule],
  selector: 'app-new-job-dialog',
  template: `
    <h2 mat-dialog-title>Nova vaga</h2>

    <form [formGroup]="form" (ngSubmit)="save()">
      <mat-dialog-content>
        <mat-form-field appearance="outline">
          <mat-label>Título da vaga</mat-label>
          <input matInput formControlName="title" placeholder="Ex.: Desenvolvedor Front-end Angular" cdkFocusInitial />
          @if (form.controls.title.hasError('required')) {
            <mat-error>Informe o título</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Stack</mat-label>
          <input matInput formControlName="stack" placeholder="Angular, TypeScript, RxJS" />
          <mat-hint>Separe as tecnologias por vírgula</mat-hint>
        </mat-form-field>

        <div class="row">
          <mat-form-field appearance="outline">
            <mat-label>Senioridade</mat-label>
            <mat-select formControlName="seniority">
              @for (s of seniorities; track s) {
                <mat-option [value]="s">{{ s }}</mat-option>
              }
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Modelo</mat-label>
            <mat-select formControlName="model">
              @for (m of models; track m) {
                <mat-option [value]="m">{{ m }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
        </div>

        <div class="row">
          <mat-form-field appearance="outline">
            <mat-label>Salário</mat-label>
            <span matTextPrefix>R$&nbsp;</span>
            <input matInput type="number" min="0" formControlName="salary" />
            @if (form.controls.salary.invalid) {
              <mat-error>Informe um valor válido</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Recrutador(a)</mat-label>
            <input matInput formControlName="recruiter" />
            @if (form.controls.recruiter.hasError('required')) {
              <mat-error>Informe o responsável</mat-error>
            }
          </mat-form-field>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button type="button" mat-dialog-close>Cancelar</button>
        <button mat-flat-button type="submit">
          <mat-icon>add</mat-icon>
          Criar vaga
        </button>
      </mat-dialog-actions>
    </form>
  `,
  styles: `
    mat-dialog-content {
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding-top: 8px !important;
    }

    .row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;

      @media (max-width: 520px) {
        grid-template-columns: 1fr;
      }
    }

    mat-form-field {
      width: 100%;
    }
  `,
})
export class NewJobDialog {
  private readonly jobs = inject(Jobs);
  private readonly dialogRef = inject<MatDialogRef<NewJobDialog, JobOpening>>(MatDialogRef);

  protected readonly seniorities = SENIORITIES;
  protected readonly models = MODELS;

  protected readonly form = inject(FormBuilder).nonNullable.group({
    title: ['', Validators.required],
    stack: [''],
    seniority: [SENIORITIES[1], Validators.required],
    model: [MODELS[0], Validators.required],
    salary: [0, [Validators.required, Validators.min(1)]],
    recruiter: ['', Validators.required],
  });

  protected save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { stack, ...value } = this.form.getRawValue();
    const job = this.jobs.create({
      ...value,
      stack: stack.split(',').map((s) => s.trim()).filter(Boolean),
    });
    this.dialogRef.close(job);
  }
}
