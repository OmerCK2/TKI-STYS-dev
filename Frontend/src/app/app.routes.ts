import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'rooms',
    loadComponent: () =>
      import('./pages/rooms/rooms.component').then((m) => m.RoomsComponent),
    canActivate: [AuthGuard],
  },
  {
    path: 'guests',
    loadComponent: () =>
      import('./pages/guests/guests.component').then((m) => m.GuestsComponent),
    canActivate: [AuthGuard],
  },
  {
    path: 'billing',
    loadComponent: () =>
      import('./pages/billing/billing.component').then((m) => m.BillingComponent),
    canActivate: [AuthGuard],
  },
  { path: '', redirectTo: 'rooms', pathMatch: 'full' },
  { path: '**', redirectTo: 'rooms' },
];
