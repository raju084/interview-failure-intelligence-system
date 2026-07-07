import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register.component').then(
        (m) => m.RegisterComponent
      ),
  },
  {
    path: '',
    loadComponent: () =>
      import('./features/shell/shell.component').then((m) => m.ShellComponent),
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent
          ),
      },
      {
        path: 'interviews',
        loadComponent: () =>
          import('./features/interviews/interview-list.component').then(
            (m) => m.InterviewListComponent
          ),
      },
      {
        path: 'interviews/new',
        loadComponent: () =>
          import('./features/interviews/interview-form.component').then(
            (m) => m.InterviewFormComponent
          ),
      },
      {
        path: 'interviews/:id/edit',
        loadComponent: () =>
          import('./features/interviews/interview-form.component').then(
            (m) => m.InterviewFormComponent
          ),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
