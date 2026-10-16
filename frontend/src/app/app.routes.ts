import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards';

export const routes: Routes = [
  {
    path: 'login',
    title: 'Iniciar sesión · Inti Wasi',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/login').then((m) => m.Login),
  },
  {
    path: '',
    canActivate: [authGuard],
    canActivateChild: [authGuard],
    loadComponent: () => import('./layout/shell').then((m) => m.Shell),
    children: [
      {
        path: 'inicio',
        title: 'Inicio · Inti Wasi',
        loadComponent: () => import('./features/inicio/inicio').then((m) => m.Inicio),
      },
      { path: '', pathMatch: 'full', redirectTo: 'inicio' },
      { path: '**', redirectTo: 'inicio' },
    ],
  },
];
