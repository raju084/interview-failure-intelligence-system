import { Component, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { InterviewService } from '../../core/interview.service';
import { Interview } from '../../core/models';
import { modeLabel, outcomeColor, outcomeLabel } from '../../core/labels';

@Component({
  selector: 'app-interview-list',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    RouterLink,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressBarModule,
    MatTooltipModule,
  ],
  template: `
    <div class="page">
      <div class="head">
        <div>
          <h1>Interview Tracker</h1>
          <p class="muted">Your complete interview history and outcomes.</p>
        </div>
        <a mat-flat-button color="primary" routerLink="/interviews/new">
          <mat-icon>add</mat-icon> Log interview
        </a>
      </div>

      <mat-progress-bar *ngIf="loading()" mode="indeterminate"></mat-progress-bar>

      <mat-card *ngIf="!loading()">
        <table mat-table [dataSource]="interviews()" class="full-width" *ngIf="interviews().length">
          <ng-container matColumnDef="company">
            <th mat-header-cell *matHeaderCellDef>Company</th>
            <td mat-cell *matCellDef="let i">
              <strong>{{ i.companyName }}</strong>
              <div class="muted small">{{ i.jobRole }}</div>
            </td>
          </ng-container>

          <ng-container matColumnDef="date">
            <th mat-header-cell *matHeaderCellDef>Date</th>
            <td mat-cell *matCellDef="let i">{{ i.interviewDate | date: 'mediumDate' }}</td>
          </ng-container>

          <ng-container matColumnDef="mode">
            <th mat-header-cell *matHeaderCellDef>Mode</th>
            <td mat-cell *matCellDef="let i">{{ modeLabel(i.mode) }}</td>
          </ng-container>

          <ng-container matColumnDef="rounds">
            <th mat-header-cell *matHeaderCellDef>Rounds</th>
            <td mat-cell *matCellDef="let i">{{ i.numberOfRounds }}</td>
          </ng-container>

          <ng-container matColumnDef="outcome">
            <th mat-header-cell *matHeaderCellDef>Outcome</th>
            <td mat-cell *matCellDef="let i">
              <span class="badge" [style.background]="outcomeColor(i.outcome)">
                {{ outcomeLabel(i.outcome) }}
              </span>
            </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef></th>
            <td mat-cell *matCellDef="let i" class="actions">
              <a mat-icon-button [routerLink]="['/interviews', i.id, 'edit']" matTooltip="Edit">
                <mat-icon>edit</mat-icon>
              </a>
              <button mat-icon-button color="warn" (click)="remove(i)" matTooltip="Delete">
                <mat-icon>delete</mat-icon>
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="columns"></tr>
          <tr mat-row *matRowDef="let row; columns: columns"></tr>
        </table>

        <div *ngIf="!interviews().length" class="empty">
          <mat-icon>inbox</mat-icon>
          <p>No interviews logged yet. Start by logging your first interview.</p>
          <a mat-stroked-button color="primary" routerLink="/interviews/new">Log interview</a>
        </div>
      </mat-card>
    </div>
  `,
  styles: [
    `
      .head {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 16px;
        margin-bottom: 16px;
      }
      h1 {
        margin: 0 0 4px;
      }
      .small {
        font-size: 12px;
      }
      .badge {
        color: #fff;
        padding: 3px 10px;
        border-radius: 999px;
        font-size: 12px;
        font-weight: 600;
      }
      .actions {
        white-space: nowrap;
        text-align: right;
      }
      .empty {
        text-align: center;
        padding: 48px 16px;
        color: #6b7686;
      }
      .empty mat-icon {
        font-size: 48px;
        height: 48px;
        width: 48px;
      }
    `,
  ],
})
export class InterviewListComponent {
  private service = inject(InterviewService);

  protected modeLabel = modeLabel;
  protected outcomeLabel = outcomeLabel;
  protected outcomeColor = outcomeColor;

  columns = ['company', 'date', 'mode', 'rounds', 'outcome', 'actions'];
  interviews = signal<Interview[]>([]);
  loading = signal(true);

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.service.list().subscribe({
      next: (data) => {
        this.interviews.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  remove(i: Interview): void {
    if (!confirm(`Delete the interview at ${i.companyName}?`)) return;
    this.service.remove(i.id).subscribe(() => this.load());
  }
}
