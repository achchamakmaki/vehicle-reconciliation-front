import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter, finalize } from 'rxjs';
import { FleetApiService, FleetDashboardStats } from '../../services/fleet-api';

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
  loading = false;
  errorMessage = '';

  constructor(
    private fleetApi: FleetApiService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.loadStats();
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      filter((event) => event.urlAfterRedirects.startsWith('/dashboard')),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(() => this.loadStats());
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
        this.stats = stats;
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage = error.status === 403
          ? 'Session expiree, veuillez vous reconnecter.'
          : 'Impossible de charger les statistiques NARSA/Sage.';
      },
    });
  }

  get cards() {
    if (!this.stats) {
      return [];
    }

    return [
      { label: 'Total NARSA vehicules', value: this.stats.totalNarsaVehicles },
      { label: 'Total Sage vehicules', value: this.stats.totalSageVehicles },
      { label: 'MATCH', value: this.stats.matchCount },
      { label: 'ABSENT_IN_SAGE', value: this.stats.absentInSageCount },
      { label: 'ABSENT_IN_NARSA', value: this.stats.absentInNarsaCount },
    ];
  }
}
