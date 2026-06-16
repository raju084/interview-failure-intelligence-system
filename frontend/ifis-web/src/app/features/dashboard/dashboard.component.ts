import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { InterviewService } from '../../core/interview.service';
import { DashboardSummary } from '../../core/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    BaseChartDirective,
  ],
  template: `
    <div class="page">
      <h1>Analytics Dashboard</h1>
      <p class="muted">Your interview intelligence at a glance.</p>

      <div *ngIf="loading()" class="loading">
        <mat-spinner diameter="40"></mat-spinner>
      </div>

      <ng-container *ngIf="!loading() && summary() as s">
        <div *ngIf="s.totalInterviews === 0" class="empty">
          <mat-icon>query_stats</mat-icon>
          <p>No data yet. Log a few interviews to unlock your Failure DNA and risk insights.</p>
          <a mat-flat-button color="primary" routerLink="/interviews/new">Log interview</a>
        </div>

        <ng-container *ngIf="s.totalInterviews > 0">
          <!-- KPI cards -->
          <div class="cards-row">
            <mat-card class="kpi">
              <span class="kpi-label">Total interviews</span>
              <span class="kpi-value">{{ s.totalInterviews }}</span>
            </mat-card>
            <mat-card class="kpi">
              <span class="kpi-label">Success rate</span>
              <span class="kpi-value">{{ s.outcomes.successRate }}%</span>
              <span class="muted small">{{ s.outcomes.selected }} selected / {{ s.outcomes.rejected }} rejected</span>
            </mat-card>
            <mat-card class="kpi">
              <span class="kpi-label">Rejections</span>
              <span class="kpi-value">{{ s.outcomes.rejected }}</span>
            </mat-card>
            <mat-card class="kpi risk">
              <span class="kpi-label">Career risk score</span>
              <span class="kpi-value" [ngClass]="riskClass(s.careerRisk.level)">
                {{ s.careerRisk.score }}
              </span>
              <span class="badge" [ngClass]="riskClass(s.careerRisk.level)">
                {{ s.careerRisk.level }} risk
              </span>
            </mat-card>
          </div>

          <!-- Charts -->
          <div class="charts">
            <mat-card class="chart-card">
              <h2>Failure DNA Profile</h2>
              <p class="muted small">Average weakness severity by category.</p>
              <div class="chart-wrap" *ngIf="s.failureDna.length; else noDna">
                <canvas baseChart [data]="dnaData()" [options]="barOptions" type="bar"></canvas>
              </div>
              <ng-template #noDna>
                <p class="muted">No weaknesses logged yet.</p>
              </ng-template>
            </mat-card>

            <mat-card class="chart-card">
              <h2>Confidence Trend</h2>
              <p class="muted small">Pre / during / post confidence over time.</p>
              <div class="chart-wrap">
                <canvas baseChart [data]="confidenceData()" [options]="lineOptions" type="line"></canvas>
              </div>
            </mat-card>
          </div>

          <div class="charts">
            <mat-card class="chart-card">
              <h2>Career Risk Drivers</h2>
              <mat-list>
                <mat-list-item *ngFor="let d of s.careerRisk.drivers">
                  <mat-icon matListItemIcon>warning_amber</mat-icon>
                  <span matListItemTitle class="wrap">{{ d }}</span>
                </mat-list-item>
              </mat-list>
            </mat-card>

            <mat-card class="chart-card">
              <h2>Recommendations</h2>
              <mat-list>
                <mat-list-item *ngFor="let r of s.topRecommendations">
                  <mat-icon matListItemIcon color="primary">lightbulb</mat-icon>
                  <span matListItemTitle class="wrap">{{ r }}</span>
                </mat-list-item>
              </mat-list>
            </mat-card>
          </div>
        </ng-container>
      </ng-container>
    </div>
  `,
  styles: [
    `
      h1 {
        margin: 0 0 4px;
      }
      h2 {
        margin: 0 0 4px;
        font-size: 16px;
      }
      .small {
        font-size: 12px;
      }
      .loading {
        display: flex;
        justify-content: center;
        padding: 60px;
      }
      .kpi {
        display: flex;
        flex-direction: column;
        gap: 4px;
        padding: 18px;
      }
      .kpi-label {
        color: #6b7686;
        font-size: 13px;
      }
      .kpi-value {
        font-size: 32px;
        font-weight: 700;
      }
      .badge {
        align-self: flex-start;
        padding: 2px 10px;
        border-radius: 999px;
        font-size: 12px;
        font-weight: 600;
        color: #fff;
      }
      .charts {
        display: grid;
        gap: 16px;
        grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
        margin-top: 16px;
      }
      .chart-card {
        padding: 18px;
      }
      .chart-wrap {
        height: 280px;
        position: relative;
      }
      .wrap {
        white-space: normal;
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
      .risk-low {
        color: #1b8a5a;
      }
      .risk-low.badge {
        background: #1b8a5a;
      }
      .risk-medium {
        color: #b8860b;
      }
      .risk-medium.badge {
        background: #b8860b;
      }
      .risk-high {
        color: #c0392b;
      }
      .risk-high.badge {
        background: #c0392b;
      }
    `,
  ],
})
export class DashboardComponent {
  private service = inject(InterviewService);

  loading = signal(true);
  summary = signal<DashboardSummary | null>(null);

  barOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scales: { y: { beginAtZero: true, max: 100 } },
    plugins: { legend: { display: false } },
  };

  lineOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scales: { y: { beginAtZero: true, max: 10 } },
  };

  dnaData = computed<ChartConfiguration<'bar'>['data']>(() => {
    const dna = this.summary()?.failureDna ?? [];
    return {
      labels: dna.map((d) => d.label),
      datasets: [
        {
          data: dna.map((d) => d.weaknessPercent),
          label: 'Weakness %',
          backgroundColor: '#c0392b',
          borderRadius: 6,
        },
      ],
    };
  });

  confidenceData = computed<ChartConfiguration<'line'>['data']>(() => {
    const trend = this.summary()?.confidenceTrend ?? [];
    const labels = trend.map((t) =>
      new Date(t.date).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      })
    );
    return {
      labels,
      datasets: [
        { data: trend.map((t) => t.pre), label: 'Pre', borderColor: '#005ac8', tension: 0.3 },
        { data: trend.map((t) => t.during), label: 'During', borderColor: '#b8860b', tension: 0.3 },
        { data: trend.map((t) => t.post), label: 'Post', borderColor: '#1b8a5a', tension: 0.3 },
      ],
    };
  });

  constructor() {
    this.service.dashboard().subscribe({
      next: (data) => {
        this.summary.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  riskClass(level: string): string {
    return `risk-${level.toLowerCase()}`;
  }
}
