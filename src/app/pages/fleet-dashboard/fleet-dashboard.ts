import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter, finalize } from 'rxjs';
import { FleetApiService, FleetDashboardStats, FuelConsumption } from '../../services/fleet-api';

@Component({
  selector: 'app-fleet-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './fleet-dashboard.html',
  styleUrl: './fleet-dashboard.css',
})
export class FleetDashboardComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  stats?: FleetDashboardStats;
  recentFuelConsumptions: FuelConsumption[] = [];
  loading = false;
  recentFuelLoading = false;
  errorMessage = '';
  recentFuelErrorMessage = '';

  constructor(
    private fleetApi: FleetApiService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.loadDashboard();
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      filter((event) => event.urlAfterRedirects.startsWith('/dashboard')),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(() => this.loadDashboard());
  }

  loadDashboard() {
    this.loadStats();
    this.loadRecentFuelConsumptions();
  }

  loadStats() {
    this.loading = true;
    this.errorMessage = '';

    this.fleetApi.getDashboardStats().pipe(
      finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      }),
    ).subscribe({
      next: (stats) => {
        console.log('Dashboard stats received:', stats);
        this.stats = stats;
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage = error.status === 403
          ? 'Session expiree, veuillez vous reconnecter.'
          : 'Impossible de charger les statistiques dashboard.';
      },
    });
  }

  loadRecentFuelConsumptions() {
    this.recentFuelLoading = true;
    this.recentFuelErrorMessage = '';

    this.fleetApi.getRecentFuelConsumptions().pipe(
      finalize(() => {
        this.recentFuelLoading = false;
        this.cdr.detectChanges();
      }),
    ).subscribe({
      next: (fuelConsumptions) => {
        console.log('Recent fuel consumptions received:', fuelConsumptions);
        this.recentFuelConsumptions = fuelConsumptions;
      },
      error: (error: HttpErrorResponse) => {
        console.warn('Recent fuel endpoint failed, fallback to /fuel-consumptions:', error);
        this.loadRecentFuelConsumptionsFallback(error);
      },
    });
  }

  loadRecentFuelConsumptionsFallback(originalError: HttpErrorResponse) {
    this.recentFuelLoading = true;

    this.fleetApi.getFuelConsumptions().pipe(
      finalize(() => {
        this.recentFuelLoading = false;
        this.cdr.detectChanges();
      }),
    ).subscribe({
      next: (fuelConsumptions) => {
        console.log('Recent fuel consumptions fallback received:', fuelConsumptions);
        this.recentFuelErrorMessage = '';
        this.recentFuelConsumptions = [...fuelConsumptions]
          .sort((first, second) => (second.id ?? 0) - (first.id ?? 0))
          .slice(0, 5);
      },
      error: (fallbackError: HttpErrorResponse) => {
        console.error('Fuel consumptions fallback failed:', fallbackError);
        this.recentFuelConsumptions = [];
        this.recentFuelErrorMessage =
          originalError.status === 403 || fallbackError.status === 403
            ? 'Session expiree, veuillez vous reconnecter.'
            : 'Impossible de charger les dernieres consommations gasoil.';
      },
    });
  }

  get cards() {
    if (!this.stats) {
      return [];
    }

    return [
      { label: 'Total vehicules', value: this.stats.totalVehicles ?? 0, icon: 'fa-truck' },
      { label: 'Vehicules conformes', value: this.stats.compliantVehicles ?? 0, icon: 'fa-circle-check' },
      { label: 'Infractions non payees', value: this.stats.unpaidInfractions ?? 0, icon: 'fa-file-invoice' },
      { label: 'Total consommation gasoil', value: this.stats.totalFuelAmount ?? this.stats.totalFuelConsumption ?? 0, money: true, icon: 'fa-gas-pump' },
      { label: 'Gasoil ce mois', value: this.stats.monthlyFuelAmount ?? this.stats.currentMonthFuelConsumption ?? 0, money: true, icon: 'fa-calendar-days' },
      { label: 'Anomalies detectees', value: this.stats.fuelAnomaliesCount ?? this.stats.detectedAnomalies ?? 0, icon: 'fa-triangle-exclamation' },
      { label: 'Vehicules absents Sage', value: this.stats.vehiclesAbsentInSage ?? this.stats.absentInSageCount ?? 0, icon: 'fa-database' },
      { label: 'Vehicules absents NARSA', value: this.stats.vehiclesAbsentInNarsa ?? this.stats.absentInNarsaCount ?? 0, icon: 'fa-building-columns' },
    ];
  }
}
