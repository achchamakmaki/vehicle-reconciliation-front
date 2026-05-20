import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AutomationLog, FleetApiService } from '../../services/fleet-api';

@Component({
  selector: 'app-automations',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './automations.html',
  styleUrl: './automations.css',
})
export class AutomationsComponent implements OnInit {
  logs: AutomationLog[] = [];

  constructor(private fleetApi: FleetApiService) {}

  ngOnInit() {
    this.loadLogs();
  }

  loadLogs() {
    this.fleetApi.getAutomationLogs().subscribe((logs) => {
      this.logs = logs;
    });
  }
}
