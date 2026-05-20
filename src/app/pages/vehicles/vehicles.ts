import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FleetApiService, Vehicle } from '../../services/fleet-api';

@Component({
  selector: 'app-vehicles',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './vehicles.html',
  styleUrl: './vehicles.css',
})
export class VehiclesComponent implements OnInit {
  vehicles: Vehicle[] = [];
  form: Vehicle = this.emptyForm();

  constructor(private fleetApi: FleetApiService) {}

  ngOnInit() {
    this.loadVehicles();
  }

  loadVehicles() {
    this.fleetApi.getVehicles().subscribe((vehicles) => {
      this.vehicles = vehicles;
    });
  }

  save() {
    const request = this.form.id
      ? this.fleetApi.updateVehicle(this.form)
      : this.fleetApi.createVehicle(this.form);

    request.subscribe(() => {
      this.form = this.emptyForm();
      this.loadVehicles();
    });
  }

  edit(vehicle: Vehicle) {
    this.form = { ...vehicle };
  }

  delete(id?: number) {
    if (!id) return;
    this.fleetApi.deleteVehicle(id).subscribe(() => this.loadVehicles());
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

  private emptyForm(): Vehicle {
    return {
      matricule: '',
      marque: '',
      modele: '',
      type: '',
      status: 'CONFORME',
      sageReference: '',
      narsaReference: '',
    };
  }
}
