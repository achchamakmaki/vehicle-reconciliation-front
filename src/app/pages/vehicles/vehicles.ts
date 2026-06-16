import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { NavigationEnd, Router } from '@angular/router';
import { filter, finalize } from 'rxjs';
import { FleetApiService, Vehicle } from '../../services/fleet-api';

@Component({
  selector: 'app-vehicles',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './vehicles.html',
  styleUrl: './vehicles.css',
})
export class VehiclesComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  vehicles: Vehicle[] = [];
  searchTerm = '';
  loading = false;
  saving = false;
  errorMessage = '';
  message = '';
  dataSource = 'Base locale';
  formVisible = false;
  form: Vehicle = this.emptyForm();

  constructor(
    private fleetApi: FleetApiService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.loadVehicles();
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      filter((event) => event.urlAfterRedirects.startsWith('/vehicles')),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(() => this.loadVehicles());
  }

  get filteredVehicles(): Vehicle[] {
    const vehicles = Array.isArray(this.vehicles) ? this.vehicles : [];
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) {
      return vehicles;
    }

    return vehicles.filter((vehicle) =>
      vehicle.matricule?.toLowerCase().includes(term) ||
      vehicle.normalizedMatricule?.toLowerCase().includes(term) ||
      vehicle.sageCode?.toLowerCase().includes(term),
    );
  }

  get filteredVehiclesCount(): number {
    return this.filteredVehicles.length;
  }

  loadVehicles() {
    this.loading = true;
    this.errorMessage = '';

    this.fleetApi.getVehicles().pipe(
      finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      }),
    ).subscribe({
      next: (vehicles) => {
        const loadedVehicles = Array.isArray(vehicles) ? vehicles : [];
        if (loadedVehicles.length > 0) {
          this.vehicles = loadedVehicles;
          this.dataSource = 'Base locale';
          return;
        }

        this.loadSageX3Vehicles();
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage = error.status === 403
          ? 'Session expiree, veuillez vous reconnecter.'
          : 'Impossible de charger les vehicules synchronises.';
      },
    });
  }

  loadSageX3Vehicles() {
    this.loading = true;
    this.errorMessage = '';

    this.fleetApi.getSageX3Vehicles().pipe(
      finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      }),
    ).subscribe({
      next: (vehicles) => {
        const loadedVehicles = Array.isArray(vehicles) ? vehicles : [];
        this.vehicles = loadedVehicles;
        this.dataSource = 'API Sage X3';
        this.message = loadedVehicles.length
          ? `${loadedVehicles.length} vehicule(s) charges depuis Sage X3.`
          : 'Aucun vehicule retourne par Sage X3.';
      },
      error: (error: HttpErrorResponse) => {
        this.vehicles = [];
        this.errorMessage = error.status === 403
          ? 'Session expiree, veuillez vous reconnecter.'
          : `Impossible de charger les vehicules depuis Sage X3. Statut ${error.status}.`;
      },
    });
  }

  openCreateForm() {
    this.form = this.emptyForm();
    this.formVisible = true;
    this.clearMessages();
  }

  edit(vehicle: Vehicle) {
    this.form = { ...vehicle };
    this.formVisible = true;
    this.clearMessages();
  }

  save() {
    this.clearMessages();

    if (!this.form.matricule?.trim()) {
      this.errorMessage = 'Matricule obligatoire.';
      return;
    }

    this.saving = true;
    const request = this.form.id
      ? this.fleetApi.updateVehicle(this.form)
      : this.fleetApi.createVehicle(this.form);

    request.pipe(
      finalize(() => {
        this.saving = false;
        this.cdr.detectChanges();
      }),
    ).subscribe({
      next: (vehicle) => {
        this.upsertVehicle(vehicle);
        this.formVisible = false;
        this.form = this.emptyForm();
        this.message = 'Vehicule enregistre avec succes.';
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage = error.status === 403
          ? 'Session expiree, veuillez vous reconnecter.'
          : 'Impossible d enregistrer le vehicule.';
      },
    });
  }

  delete(vehicle: Vehicle) {
    this.clearMessages();

    if (!vehicle.id || !window.confirm(`Supprimer le vehicule ${vehicle.matricule} ?`)) {
      return;
    }

    this.fleetApi.deleteVehicle(vehicle.id).subscribe({
      next: () => {
        this.vehicles = this.vehicles.filter((currentVehicle) => currentVehicle.id !== vehicle.id);
        this.message = 'Vehicule supprime avec succes.';
        this.cdr.detectChanges();
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage = error.status === 403
          ? 'Session expiree, veuillez vous reconnecter.'
          : 'Impossible de supprimer le vehicule.';
      },
    });
  }

  statusLabel(status?: string) {
    switch (status) {
      case 'CONFORME':
        return 'Conforme';
      case 'ABSENT_IN_SAGE':
        return 'Absent Sage';
      case 'ABSENT_IN_NARSA':
        return 'Absent NARSA';
      default:
        return status || 'Non defini';
    }
  }

  statusClass(status?: string) {
    return (status || 'UNKNOWN').toLowerCase();
  }

  private upsertVehicle(vehicle: Vehicle) {
    const vehicles = Array.isArray(this.vehicles) ? this.vehicles : [];
    const index = vehicles.findIndex((currentVehicle) => currentVehicle.id === vehicle.id);
    if (index >= 0) {
      this.vehicles = vehicles.map((currentVehicle) => currentVehicle.id === vehicle.id ? vehicle : currentVehicle);
      return;
    }

    this.vehicles = [vehicle, ...vehicles];
  }

  private clearMessages() {
    this.message = '';
    this.errorMessage = '';
  }

  private emptyForm(): Vehicle {
    return {
      matricule: '',
      sageCode: '',
      marque: '',
      modele: '',
      type: '',
      status: 'CONFORME',
      source: 'MANUAL',
    };
  }
}
