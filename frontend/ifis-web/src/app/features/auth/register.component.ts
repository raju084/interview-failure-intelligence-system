import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { AuthService } from '../../core/auth.service';
import { USER_ROLES } from '../../core/models';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressBarModule,
  ],
  template: `
    <div class="auth-wrap">
      <mat-card class="auth-card">
        <mat-progress-bar *ngIf="loading()" mode="indeterminate"></mat-progress-bar>
        <mat-card-header>
          <mat-card-title>Create your IFIS account</mat-card-title>
          <mat-card-subtitle>Turn interview failures into actionable insights</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="submit()" class="grid">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Full name</mat-label>
              <input matInput formControlName="fullName" autocomplete="name" />
            </mat-form-field>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email</mat-label>
              <input matInput type="email" formControlName="email" autocomplete="email" />
            </mat-form-field>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Password</mat-label>
              <input matInput type="password" formControlName="password" autocomplete="new-password" />
              <mat-hint>At least 6 characters</mat-hint>
            </mat-form-field>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>I am a</mat-label>
              <mat-select formControlName="role">
                <mat-option [value]="0">Candidate</mat-option>
                <mat-option [value]="1">Career Mentor</mat-option>
              </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Target role (optional)</mat-label>
              <input matInput formControlName="targetRole" placeholder="e.g. Backend Developer" />
            </mat-form-field>
            <p *ngIf="error()" class="error">{{ error() }}</p>
            <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid || loading()">
              Create account
            </button>
            <p class="muted">Already registered? <a routerLink="/login">Sign in</a></p>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [
    `
      .auth-wrap {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
      }
      .auth-card {
        width: 100%;
        max-width: 440px;
        padding-bottom: 12px;
      }
      .error {
        color: #c0392b;
        margin: 0;
      }
    `,
  ],
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  protected roles = USER_ROLES;
  loading = signal(false);
  error = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    fullName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    role: [0, [Validators.required]],
    targetRole: [''],
  });

  submit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set(null);
    this.auth.register(this.form.getRawValue()).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => {
        this.error.set(err?.error?.message ?? 'Registration failed. Please try again.');
        this.loading.set(false);
      },
    });
  }
}
