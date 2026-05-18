import { Routes } from '@angular/router';
import { ReconciliationComponent } from './pages/reconciliation/reconciliation';
import { DashboardComponent } from './pages/dashboard/dashboard';
import { LoginComponent } from './pages/login/login';
import { RegisterComponent } from './pages/register/register';
import { AppLayoutComponent } from './layout/app-layout/app-layout';
import { authChildGuard, authGuard } from './auth/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: '',
    component: AppLayoutComponent,
    canActivate: [authGuard],
    canActivateChild: [authChildGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'reconciliation', component: ReconciliationComponent },
      { path: 'narsa-vehicles', component: ReconciliationComponent },
      { path: 'sage-vehicles', component: ReconciliationComponent },
      { path: 'results', component: ReconciliationComponent },
      { path: 'history', component: ReconciliationComponent },
      { path: 'settings', component: ReconciliationComponent },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
