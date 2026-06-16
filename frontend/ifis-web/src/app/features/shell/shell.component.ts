import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
  ],
  template: `
    <mat-toolbar color="primary" class="topbar">
      <button mat-icon-button (click)="drawer.toggle()" aria-label="Toggle navigation">
        <mat-icon>menu</mat-icon>
      </button>
      <span class="brand">IFIS</span>
      <span class="muted-light">Interview Failure Intelligence</span>
      <span class="spacer"></span>
      <button mat-button [matMenuTriggerFor]="menu">
        <mat-icon>account_circle</mat-icon>
        {{ auth.user()?.fullName }}
      </button>
      <mat-menu #menu="matMenu">
        <button mat-menu-item disabled>{{ auth.user()?.email }}</button>
        <button mat-menu-item (click)="logout()">
          <mat-icon>logout</mat-icon>
          <span>Logout</span>
        </button>
      </mat-menu>
    </mat-toolbar>

    <mat-sidenav-container class="container">
      <mat-sidenav #drawer mode="side" opened class="sidenav">
        <mat-nav-list>
          <a
            mat-list-item
            routerLink="/dashboard"
            routerLinkActive="active-link"
          >
            <mat-icon matListItemIcon>insights</mat-icon>
            <span matListItemTitle>Dashboard</span>
          </a>
          <a
            mat-list-item
            routerLink="/interviews"
            routerLinkActive="active-link"
          >
            <mat-icon matListItemIcon>work_history</mat-icon>
            <span matListItemTitle>Interview Tracker</span>
          </a>
          <a
            mat-list-item
            routerLink="/interviews/new"
            routerLinkActive="active-link"
          >
            <mat-icon matListItemIcon>add_circle</mat-icon>
            <span matListItemTitle>Log Interview</span>
          </a>
        </mat-nav-list>
      </mat-sidenav>

      <mat-sidenav-content>
        <router-outlet></router-outlet>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [
    `
      .topbar {
        position: sticky;
        top: 0;
        z-index: 10;
        gap: 12px;
      }
      .brand {
        font-weight: 700;
        font-size: 20px;
      }
      .muted-light {
        opacity: 0.75;
        font-size: 13px;
      }
      .container {
        position: absolute;
        top: 64px;
        bottom: 0;
        left: 0;
        right: 0;
      }
      .sidenav {
        width: 240px;
        border-right: 1px solid #e3e8f0;
      }
      .active-link {
        background: rgba(0, 90, 200, 0.08);
        font-weight: 600;
      }
    `,
  ],
})
export class ShellComponent {
  protected auth = inject(AuthService);
  private router = inject(Router);

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
