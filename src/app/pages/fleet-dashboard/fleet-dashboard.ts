import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FleetApiService, FleetDashboardStats } from '../../services/fleet-api';

@Component({
  selector: 'app-fleet-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './fleet-dashboard.html',
  styleUrl: './fleet-dashboard.css',
})
export class FleetDashboardComponent implements OnInit {
  stats?: FleetDashboardStats;

  constructor(private fleetApi: FleetApiService) {}

  ngOnInit() {
    this.fleetApi.getDashboardStats().subscribe((stats) => {
      this.stats = stats;
    });
  }

  get cards() {
    return [
      { label: 'Total vehicules', value: this.stats?.totalVehicles ?? 0 },
      { label: 'Vehicules conformes', value: this.stats?.compliantVehicles ?? 0 },
      { label: 'Infractions non payees', value: this.stats?.unpaidInfractions ?? 0 },
      { label: 'Total consommation gasoil', value: this.stats?.totalFuelConsumption ?? 0 },
      { label: 'Gasoil ce mois', value: this.stats?.currentMonthFuelConsumption ?? 0 },
      { label: 'Anomalies detectees', value: this.stats?.detectedAnomalies ?? 0 },
      { label: 'Vehicules absents Sage', value: this.stats?.vehiclesAbsentInSage ?? 0 },
      { label: 'Vehicules absents NARSA', value: this.stats?.vehiclesAbsentInNarsa ?? 0 },
    ];
  }
}
