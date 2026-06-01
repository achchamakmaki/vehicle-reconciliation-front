import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { FleetApiService, Infraction } from '../../services/fleet-api';

@Component({
  selector: 'app-infractions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './infractions.html',
  styleUrl: './infractions.css',
})
export class InfractionsComponent implements OnInit {
  infractions: Infraction[] = [];
  form: Infraction = this.emptyForm();
  importing = false;
  loading = false;
  message = '';
  error = '';

  constructor(
    private fleetApi: FleetApiService,
    private changeDetector: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.loadInfractions();
  }

  loadInfractions() {
    this.loading = true;
    this.error = '';

    this.fleetApi.getInfractions().subscribe({
      next: (infractions) => {
        this.infractions = infractions;
        this.loading = false;
        this.changeDetector.detectChanges();
      },
      error: (error) => {
        this.infractions = [];
        this.loading = false;
        this.error =
          error?.status === 403
            ? 'Session expiree, veuillez vous reconnecter.'
            : 'Impossible de charger les infractions.';
        this.changeDetector.detectChanges();
      },
    });
  }

  save() {
    const request = this.form.id
      ? this.fleetApi.updateInfraction(this.form)
      : this.fleetApi.createInfraction(this.form);

    request.subscribe({
      next: () => {
        this.message = this.form.id ? 'Infraction modifiee avec succes.' : 'Infraction ajoutee avec succes.';
        this.error = '';
        this.form = this.emptyForm();
        this.loadInfractions();
      },
      error: () => {
        this.error = 'Impossible d enregistrer l infraction.';
      },
    });
  }

  edit(infraction: Infraction) {
    this.form = { ...infraction };
  }

  delete(id?: number) {
    if (!id) return;
    this.fleetApi.deleteInfraction(id).subscribe({
      next: () => {
        this.message = 'Infraction supprimee avec succes.';
        this.error = '';
        this.loadInfractions();
      },
      error: () => {
        this.error = 'Impossible de supprimer l infraction.';
      },
    });
  }

  uploadExcel(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.importing = true;
    this.message = '';
    this.error = '';

    this.fleetApi
      .uploadInfractions(file)
      .pipe(
        finalize(() => {
          this.importing = false;
          input.value = '';
        }),
      )
      .subscribe({
        next: (result) => {
          this.message = `${result.imported} infraction(s) importee(s) depuis NARSA.`;
          this.loadInfractions();
        },
        error: () => {
          this.error = 'Import Excel NARSA impossible. Verifiez le fichier et votre session.';
        },
      });
  }

  trackByInfraction(_: number, infraction: Infraction) {
    return infraction.id || infraction.reference || infraction.matricule;
  }

  paymentBadgeClass(status?: string) {
    const value = this.normalizeStatus(status);
    return value === 'PAYE' ? 'badge badge-green' : 'badge badge-orange';
  }

  infractionBadgeClass(status?: string) {
    return status === 'OK' ? 'badge badge-green' : 'badge badge-red';
  }

  displayStatus(status?: string) {
    return status || 'VEHICULE_INTROUVABLE';
  }

  private normalizeStatus(status?: string) {
    return (status || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '_')
      .toUpperCase();
  }

  private emptyForm(): Infraction {
    return {
      matricule: '',
      driverName: '',
      infractionDate: '',
      location: '',
      owner: '',
      tenant: '',
      type: '',
      amount: 0,
      points: 0,
      paymentStatus: 'NON_PAYE',
      reference: '',
      status: 'VEHICULE_INTROUVABLE',
      notes: '',
    };
  }
}
