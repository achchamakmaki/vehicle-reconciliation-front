import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FleetApiService, FuelConsumption } from '../../services/fleet-api';

@Component({
  selector: 'app-fuel-consumptions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './fuel-consumptions.html',
  styleUrl: './fuel-consumptions.css',
})
export class FuelConsumptionsComponent implements OnInit, OnDestroy {
  fuelConsumptions: FuelConsumption[] = [];
  form: FuelConsumption = this.emptyForm();
  selectedReceipt?: File;
  receiptImageUrls: Record<number, string> = {};
  selectedReceiptUrl = '';
  loading = false;
  errorMessage = '';
  message = '';

  constructor(
    private fleetApi: FleetApiService,
    private changeDetector: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.loadFuelConsumptions();
  }

  ngOnDestroy() {
    this.revokeReceiptUrls();
  }

  loadFuelConsumptions() {
    this.loading = true;
    this.errorMessage = '';

    this.fleetApi.getFuelConsumptions().subscribe({
      next: (fuelConsumptions) => {
        console.log('Fuel consumptions received:', fuelConsumptions);
        this.fuelConsumptions = fuelConsumptions;
        this.loadReceiptThumbnails(fuelConsumptions);
        this.loading = false;
        this.changeDetector.detectChanges();
      },
      error: (error) => {
        console.error('Fuel consumptions load error:', error);
        this.fuelConsumptions = [];
        this.loading = false;
        this.errorMessage =
          error?.status === 403
            ? 'Session expiree, veuillez vous reconnecter.'
            : 'Impossible de charger les consommations gasoil.';
        this.changeDetector.detectChanges();
      },
    });
  }

  save() {
    const request = this.form.id
      ? this.fleetApi.updateFuelConsumption(this.form)
      : this.fleetApi.createFuelConsumption(this.form);

    request.subscribe((fuelConsumption) => {
      if (this.selectedReceipt && fuelConsumption.id) {
        this.fleetApi.uploadFuelReceipt(fuelConsumption.id, this.selectedReceipt).subscribe(() => {
          this.resetForm();
        });
        return;
      }

      this.message = 'Consommation gasoil enregistree avec succes.';
      this.resetForm();
    });
  }

  onReceiptSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    this.selectedReceipt = input.files?.[0];
  }

  edit(fuelConsumption: FuelConsumption) {
    this.form = { ...fuelConsumption };
  }

  delete(id?: number) {
    if (!id) return;
    this.fleetApi.deleteFuelConsumption(id).subscribe(() => {
      this.message = 'Consommation gasoil supprimee avec succes.';
      this.loadFuelConsumptions();
    });
  }

  statusClass(status?: string) {
    return (status || 'UNKNOWN').toLowerCase();
  }

  hasReceipt(fuelConsumption: FuelConsumption) {
    return !!fuelConsumption.receiptPhotoPath || !!fuelConsumption.receiptPhotoUrl;
  }

  receiptPreviewUrl(fuelConsumption: FuelConsumption) {
    if (fuelConsumption.id && this.receiptImageUrls[fuelConsumption.id]) {
      return this.receiptImageUrls[fuelConsumption.id];
    }

    return fuelConsumption.receiptPhotoUrl || '';
  }

  openReceipt(fuelConsumption: FuelConsumption) {
    const receiptUrl = this.receiptPreviewUrl(fuelConsumption);
    if (!receiptUrl) return;

    this.selectedReceiptUrl = receiptUrl;
  }

  closeReceipt() {
    this.selectedReceiptUrl = '';
  }

  private loadReceiptThumbnails(fuelConsumptions: FuelConsumption[]) {
    this.revokeReceiptUrls();

    fuelConsumptions
      .filter((fuelConsumption) => fuelConsumption.id && this.hasReceipt(fuelConsumption))
      .forEach((fuelConsumption) => {
        if (!fuelConsumption.id) return;

        if (!fuelConsumption.receiptPhotoPath && fuelConsumption.receiptPhotoUrl?.startsWith('http')) {
          this.receiptImageUrls[fuelConsumption.id] = fuelConsumption.receiptPhotoUrl;
          return;
        }

        this.fleetApi.getFuelReceipt(fuelConsumption.id).subscribe({
          next: (receiptBlob) => {
            this.receiptImageUrls[fuelConsumption.id!] = URL.createObjectURL(receiptBlob);
            this.changeDetector.detectChanges();
          },
          error: (error) => {
            console.warn('Impossible de charger le ticket gasoil', fuelConsumption.id, error);
          },
        });
      });
  }

  private revokeReceiptUrls() {
    Object.values(this.receiptImageUrls)
      .filter((url) => url.startsWith('blob:'))
      .forEach((url) => URL.revokeObjectURL(url));

    this.receiptImageUrls = {};
  }

  private resetForm() {
    this.form = this.emptyForm();
    this.selectedReceipt = undefined;
    this.loadFuelConsumptions();
  }

  private emptyForm(): FuelConsumption {
    return {
      matricule: '',
      driverName: '',
      station: '',
      consumptionDate: '',
      fuelTime: '',
      invoiceNumber: '',
      product: '',
      liters: 0,
      unitPrice: 0,
      amount: 0,
      paymentMethod: '',
      status: 'VEHICULE_INTROUVABLE',
      notes: '',
    };
  }
}
