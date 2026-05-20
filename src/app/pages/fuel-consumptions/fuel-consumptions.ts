import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FleetApiService, FuelConsumption } from '../../services/fleet-api';

@Component({
  selector: 'app-fuel-consumptions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './fuel-consumptions.html',
  styleUrl: './fuel-consumptions.css',
})
export class FuelConsumptionsComponent implements OnInit {
  fuelConsumptions: FuelConsumption[] = [];
  form: FuelConsumption = this.emptyForm();
  selectedReceipt?: File;

  constructor(private fleetApi: FleetApiService) {}

  ngOnInit() {
    this.loadFuelConsumptions();
  }

  loadFuelConsumptions() {
    this.fleetApi.getFuelConsumptions().subscribe((fuelConsumptions) => {
      this.fuelConsumptions = fuelConsumptions;
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
    this.fleetApi.deleteFuelConsumption(id).subscribe(() => this.loadFuelConsumptions());
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
      liters: 0,
      amount: 0,
      notes: '',
    };
  }
}
