import { Routes } from '@angular/router';
import { ReconciliationComponent } from './pages/reconciliation/reconciliation';
import { AppLayoutComponent } from './layout/app-layout/app-layout';
import { FleetDashboardComponent } from './pages/fleet-dashboard/fleet-dashboard';
import { VehiclesComponent } from './pages/vehicles/vehicles';
import { DriversComponent } from './pages/drivers/drivers';
import { InfractionsComponent } from './pages/infractions/infractions';
import { FuelConsumptionsComponent } from './pages/fuel-consumptions/fuel-consumptions';
import { AutomationsComponent } from './pages/automations/automations';
import { PlaceholderPageComponent } from './pages/placeholder-page/placeholder-page';
import { LoginComponent } from './pages/login/login';
import { RegisterComponent } from './pages/register/register';
import { authChildGuard, authGuard } from './auth/auth.guard';
import { adminGuard } from './auth/auth.guard';
import { UsersManagementComponent } from './pages/users-management/users-management';

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
      { path: 'dashboard', component: FleetDashboardComponent },
      { path: 'vehicles', component: VehiclesComponent },
      { path: 'drivers', component: DriversComponent },
      { path: 'users-management', component: UsersManagementComponent, canActivate: [adminGuard] },
      { path: 'reconciliation', component: ReconciliationComponent },
      { path: 'infractions', component: InfractionsComponent },
      { path: 'fuel-consumptions', component: FuelConsumptionsComponent },
      { path: 'reports', component: PlaceholderPageComponent, data: { title: 'Rapports' } },
      { path: 'automations', component: AutomationsComponent },
      { path: 'settings', component: PlaceholderPageComponent, data: { title: 'Parametres' } },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
