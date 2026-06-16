import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { NavigationEnd, Router } from '@angular/router';
import { filter, finalize } from 'rxjs';
import { Driver, FleetApiService } from '../../services/fleet-api';

@Component({
  selector: 'app-drivers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './drivers.html',
  styleUrl: './drivers.css',
})
export class DriversComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  drivers: Driver[] = [];
  form: Driver = this.emptyForm();
  loading = false;
  saving = false;
  errorMessage = '';
  message = '';

  constructor(
    private fleetApi: FleetApiService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.loadDrivers();
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      filter((event) => event.urlAfterRedirects.startsWith('/drivers')),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(() => this.loadDrivers());
  }

  get safeDrivers(): Driver[] {
    return Array.isArray(this.drivers) ? this.drivers : [];
  }

  get driversCount(): number {
    return this.safeDrivers.length;
  }

  loadDrivers() {
    this.loading = true;
    this.errorMessage = '';

    this.fleetApi.getDrivers().pipe(
      finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      }),
    ).subscribe({
      next: (drivers) => {
        this.drivers = Array.isArray(drivers) ? drivers : [];
      },
      error: (error: HttpErrorResponse) => {
        this.drivers = [];
        this.errorMessage = error.status === 403
          ? 'Session expiree, veuillez vous reconnecter.'
          : 'Impossible de charger les chauffeurs.';
      },
    });
  }

  save() {
    this.clearMessages();

    if (!this.form.fullName?.trim()) {
      this.errorMessage = 'Nom complet obligatoire.';
      return;
    }

    this.saving = true;
    const request = this.form.id ? this.fleetApi.updateDriver(this.form) : this.fleetApi.createDriver(this.form);
    request.pipe(
      finalize(() => {
        this.saving = false;
        this.cdr.detectChanges();
      }),
    ).subscribe({
      next: () => {
        this.form = this.emptyForm();
        this.message = 'Chauffeur enregistre avec succes.';
        this.loadDrivers();
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage = error.status === 403
          ? 'Session expiree, veuillez vous reconnecter.'
          : 'Impossible d enregistrer le chauffeur.';
      },
    });
  }

  edit(driver: Driver) {
    this.form = { ...driver };
    this.clearMessages();
  }

  delete(id?: number) {
    if (!id) return;
    this.clearMessages();

    this.fleetApi.deleteDriver(id).subscribe({
      next: () => {
        this.message = 'Chauffeur supprime avec succes.';
        this.loadDrivers();
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage = error.status === 403
          ? 'Session expiree, veuillez vous reconnecter.'
          : 'Impossible de supprimer le chauffeur.';
      },
    });
  }

  private clearMessages() {
    this.message = '';
    this.errorMessage = '';
  }

  private emptyForm(): Driver {
    return {
      fullName: '',
      phone: '',
      cin: '',
      licenseNumber: '',
      status: 'ACTIF',
    };
  }
}
