import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Driver, FleetApiService } from '../../services/fleet-api';

@Component({
  selector: 'app-drivers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './drivers.html',
  styleUrl: './drivers.css',
})
export class DriversComponent implements OnInit {
  drivers: Driver[] = [];
  form: Driver = this.emptyForm();

  constructor(private fleetApi: FleetApiService) {}

  ngOnInit() {
    this.loadDrivers();
  }

  loadDrivers() {
    this.fleetApi.getDrivers().subscribe((drivers) => {
      this.drivers = drivers;
    });
  }

  save() {
    const request = this.form.id ? this.fleetApi.updateDriver(this.form) : this.fleetApi.createDriver(this.form);
    request.subscribe(() => {
      this.form = this.emptyForm();
      this.loadDrivers();
    });
  }

  edit(driver: Driver) {
    this.form = { ...driver };
  }

  delete(id?: number) {
    if (!id) return;
    this.fleetApi.deleteDriver(id).subscribe(() => this.loadDrivers());
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
