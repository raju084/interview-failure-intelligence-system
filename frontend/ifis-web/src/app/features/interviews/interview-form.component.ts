import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormArray,
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { InterviewService } from '../../core/interview.service';
import {
  INTERVIEW_MODES,
  INTERVIEW_OUTCOMES,
  WEAKNESS_CATEGORIES,
  InterviewUpsert,
} from '../../core/models';
import { modeLabel, outcomeLabel, weaknessLabel } from '../../core/labels';

@Component({
  selector: 'app-interview-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSlideToggleModule,
    MatProgressBarModule,
  ],
  template: `
    <div class="page">
      <h1>{{ id ? 'Edit interview' : 'Log a new interview' }}</h1>
      <p class="muted">Capture the details, round breakdown, confidence levels and observed weaknesses.</p>

      <mat-progress-bar *ngIf="loading()" mode="indeterminate"></mat-progress-bar>

      <form [formGroup]="form" (ngSubmit)="submit()">
        <mat-card class="section">
          <h2>Interview details</h2>
          <div class="grid two">
            <mat-form-field appearance="outline">
              <mat-label>Company name</mat-label>
              <input matInput formControlName="companyName" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Job role</mat-label>
              <input matInput formControlName="jobRole" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Interview date</mat-label>
              <input matInput [matDatepicker]="picker" formControlName="interviewDate" />
              <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
              <mat-datepicker #picker></mat-datepicker>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Mode</mat-label>
              <mat-select formControlName="mode">
                <mat-option *ngFor="let m of modes; let i = index" [value]="i">
                  {{ modeLabel(i) }}
                </mat-option>
              </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Number of rounds</mat-label>
              <input matInput type="number" min="1" formControlName="numberOfRounds" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Outcome</mat-label>
              <mat-select formControlName="outcome">
                <mat-option *ngFor="let o of outcomes; let i = index" [value]="i">
                  {{ outcomeLabel(i) }}
                </mat-option>
              </mat-select>
            </mat-form-field>
          </div>
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Candidate feedback / notes</mat-label>
            <textarea matInput rows="3" formControlName="candidateFeedback"></textarea>
          </mat-form-field>
        </mat-card>

        <mat-card class="section">
          <h2>Confidence levels (0-10)</h2>
          <div class="grid three">
            <mat-form-field appearance="outline">
              <mat-label>Before interview</mat-label>
              <input matInput type="number" min="0" max="10" formControlName="preConfidence" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>During interview</mat-label>
              <input matInput type="number" min="0" max="10" formControlName="duringConfidence" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>After interview</mat-label>
              <input matInput type="number" min="0" max="10" formControlName="postConfidence" />
            </mat-form-field>
          </div>
        </mat-card>

        <mat-card class="section">
          <div class="section-head">
            <h2>Rounds</h2>
            <button mat-stroked-button type="button" (click)="addRound()">
              <mat-icon>add</mat-icon> Add round
            </button>
          </div>
          <div formArrayName="rounds">
            <div *ngFor="let r of rounds.controls; let i = index" [formGroupName]="i" class="row-item">
              <mat-form-field appearance="outline" class="num">
                <mat-label>#</mat-label>
                <input matInput type="number" min="1" formControlName="roundNumber" />
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Type</mat-label>
                <input matInput formControlName="roundType" placeholder="Technical / HR" />
              </mat-form-field>
              <mat-slide-toggle formControlName="cleared">Cleared</mat-slide-toggle>
              <mat-form-field appearance="outline" class="grow">
                <mat-label>Notes</mat-label>
                <input matInput formControlName="notes" />
              </mat-form-field>
              <button mat-icon-button color="warn" type="button" (click)="rounds.removeAt(i)">
                <mat-icon>close</mat-icon>
              </button>
            </div>
            <p *ngIf="!rounds.length" class="muted">No rounds added.</p>
          </div>
        </mat-card>

        <mat-card class="section">
          <div class="section-head">
            <h2>Observed weaknesses</h2>
            <button mat-stroked-button type="button" (click)="addWeakness()">
              <mat-icon>add</mat-icon> Add weakness
            </button>
          </div>
          <div formArrayName="weaknesses">
            <div *ngFor="let w of weaknesses.controls; let i = index" [formGroupName]="i" class="row-item">
              <mat-form-field appearance="outline">
                <mat-label>Category</mat-label>
                <mat-select formControlName="category">
                  <mat-option *ngFor="let c of categories; let ci = index" [value]="ci">
                    {{ weaknessLabel(ci) }}
                  </mat-option>
                </mat-select>
              </mat-form-field>
              <mat-form-field appearance="outline" class="num">
                <mat-label>Severity %</mat-label>
                <input matInput type="number" min="0" max="100" formControlName="severityPercent" />
              </mat-form-field>
              <mat-form-field appearance="outline" class="grow">
                <mat-label>Topic (optional)</mat-label>
                <input matInput formControlName="topic" placeholder="e.g. SQL joins" />
              </mat-form-field>
              <button mat-icon-button color="warn" type="button" (click)="weaknesses.removeAt(i)">
                <mat-icon>close</mat-icon>
              </button>
            </div>
            <p *ngIf="!weaknesses.length" class="muted">No weaknesses added.</p>
          </div>
        </mat-card>

        <p *ngIf="error()" class="error">{{ error() }}</p>
        <div class="form-actions">
          <button mat-button type="button" (click)="cancel()">Cancel</button>
          <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid || loading()">
            {{ id ? 'Save changes' : 'Create interview' }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [
    `
      h1 {
        margin: 0 0 4px;
      }
      h2 {
        margin: 0 0 12px;
        font-size: 16px;
      }
      .section {
        padding: 20px;
        margin: 16px 0;
      }
      .section-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 12px;
      }
      .grid.two {
        display: grid;
        gap: 0 16px;
        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      }
      .grid.three {
        display: grid;
        gap: 0 16px;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      }
      .row-item {
        display: flex;
        align-items: center;
        gap: 12px;
        flex-wrap: wrap;
      }
      .num {
        width: 110px;
      }
      .grow {
        flex: 1 1 200px;
      }
      .form-actions {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
        margin-top: 8px;
      }
      .error {
        color: #c0392b;
      }
    `,
  ],
})
export class InterviewFormComponent {
  private fb = inject(FormBuilder);
  private service = inject(InterviewService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  protected modes = INTERVIEW_MODES;
  protected outcomes = INTERVIEW_OUTCOMES;
  protected categories = WEAKNESS_CATEGORIES;
  protected modeLabel = modeLabel;
  protected outcomeLabel = outcomeLabel;
  protected weaknessLabel = weaknessLabel;

  id: number | null = null;
  loading = signal(false);
  error = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    companyName: ['', [Validators.required]],
    jobRole: ['', [Validators.required]],
    interviewDate: [new Date(), [Validators.required]],
    mode: [0, [Validators.required]],
    numberOfRounds: [1, [Validators.required, Validators.min(1)]],
    outcome: [0, [Validators.required]],
    candidateFeedback: [''],
    preConfidence: [5, [Validators.min(0), Validators.max(10)]],
    duringConfidence: [5, [Validators.min(0), Validators.max(10)]],
    postConfidence: [5, [Validators.min(0), Validators.max(10)]],
    rounds: this.fb.array<ReturnType<typeof this.buildRound>>([]),
    weaknesses: this.fb.array<ReturnType<typeof this.buildWeakness>>([]),
  });

  get rounds(): FormArray {
    return this.form.get('rounds') as FormArray;
  }
  get weaknesses(): FormArray {
    return this.form.get('weaknesses') as FormArray;
  }

  constructor() {
    const param = this.route.snapshot.paramMap.get('id');
    if (param) {
      this.id = Number(param);
      this.loadExisting(this.id);
    }
  }

  private buildRound(value?: {
    roundNumber: number;
    roundType: string;
    cleared: boolean;
    notes?: string | null;
  }) {
    return this.fb.nonNullable.group({
      roundNumber: [value?.roundNumber ?? this.rounds.length + 1],
      roundType: [value?.roundType ?? 'Technical'],
      cleared: [value?.cleared ?? false],
      notes: [value?.notes ?? ''],
    });
  }

  private buildWeakness(value?: {
    category: number;
    severityPercent: number;
    topic?: string | null;
  }) {
    return this.fb.nonNullable.group({
      category: [value?.category ?? 0],
      severityPercent: [value?.severityPercent ?? 50],
      topic: [value?.topic ?? ''],
    });
  }

  addRound(): void {
    this.rounds.push(this.buildRound());
  }
  addWeakness(): void {
    this.weaknesses.push(this.buildWeakness());
  }

  private loadExisting(id: number): void {
    this.loading.set(true);
    this.service.get(id).subscribe({
      next: (i) => {
        this.form.patchValue({
          companyName: i.companyName,
          jobRole: i.jobRole,
          interviewDate: new Date(i.interviewDate),
          mode: i.mode,
          numberOfRounds: i.numberOfRounds,
          outcome: i.outcome,
          candidateFeedback: i.candidateFeedback ?? '',
          preConfidence: i.preConfidence,
          duringConfidence: i.duringConfidence,
          postConfidence: i.postConfidence,
        });
        i.rounds.forEach((r) => this.rounds.push(this.buildRound(r)));
        i.weaknesses.forEach((w) => this.weaknesses.push(this.buildWeakness(w)));
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Could not load this interview.');
        this.loading.set(false);
      },
    });
  }

  submit(): void {
    if (this.form.invalid) return;
    const raw = this.form.getRawValue();
    const payload: InterviewUpsert = {
      ...raw,
      interviewDate: new Date(raw.interviewDate).toISOString(),
    };

    this.loading.set(true);
    this.error.set(null);
    const op = this.id
      ? this.service.update(this.id, payload)
      : this.service.create(payload);

    op.subscribe({
      next: () => this.router.navigate(['/interviews']),
      error: (err) => {
        this.error.set(err?.error?.message ?? 'Could not save the interview.');
        this.loading.set(false);
      },
    });
  }

  cancel(): void {
    this.router.navigate(['/interviews']);
  }
}
