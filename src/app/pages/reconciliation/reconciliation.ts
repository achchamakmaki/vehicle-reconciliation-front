import { Component, OnInit } from '@angular/core';
import {
  VehicleReconciliation,
  ComparisonResult,
  DashboardStats,
} from '../../services/vehicle-reconciliation';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reconciliation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reconciliation.html',
  styleUrl: './reconciliation.css',
})
export class ReconciliationComponent implements OnInit {
  narsaFile?: File;
  sageFile?: File;
  results: ComparisonResult[] = [];
  message = '';
  stats: DashboardStats = {
    totalNarsaVehicles: 0,
    totalSageVehicles: 0,
    matchCount: 0,
    absentInSageCount: 0,
    absentInNarsaCount: 0,
  };

  constructor(private service: VehicleReconciliation) {}

  ngOnInit() {
    this.loadDashboardStats();
  }

  get dashboardCards() {
    return [
      {
        label: 'Total NARSA vehicles',
        value: this.stats.totalNarsaVehicles,
        tone: 'narsa',
      },
      {
        label: 'Total Sage vehicles',
        value: this.stats.totalSageVehicles,
        tone: 'sage',
      },
      {
        label: 'MATCH',
        value: this.stats.matchCount,
        tone: 'match',
      },
      {
        label: 'ABSENT_IN_SAGE',
        value: this.stats.absentInSageCount,
        tone: 'warning',
      },
      {
        label: 'ABSENT_IN_NARSA',
        value: this.stats.absentInNarsaCount,
        tone: 'danger',
      },
    ];
  }

  onNarsaFileSelected(event: any) {
    this.narsaFile = event.target.files[0];
  }

  onSageFileSelected(event: any) {
    this.sageFile = event.target.files[0];
  }

  uploadNarsa() {
    if (!this.narsaFile) return;

    this.service.uploadNarsa(this.narsaFile).subscribe((res) => {
      this.message = res;
      this.loadDashboardStats();
    });
  }

  uploadSage() {
    if (!this.sageFile) return;

    this.service.uploadSage(this.sageFile).subscribe((res) => {
      this.message = res;
      this.loadDashboardStats();
    });
  }

  compare() {
    this.service.compare().subscribe((res) => {
      this.message = res;

      setTimeout(() => {
        this.loadResults();
      }, 500);
    });
  }

  loadResults() {
    this.service.getResults().subscribe((data) => {
      this.results = data;
      this.loadDashboardStats();
    });
  }

  loadDashboardStats() {
    this.service.getStats().subscribe((data) => {
      this.stats = data;
    });
  }

  resetData() {
    this.service.resetData().subscribe((res) => {
      this.message = res;
      this.results = [];
      this.narsaFile = undefined;
      this.sageFile = undefined;
      this.loadDashboardStats();
    });
  }

  exportExcel() {
    this.service.exportResults().subscribe((file) => {
      const url = window.URL.createObjectURL(file);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'comparison-results.xlsx';
      link.click();
      window.URL.revokeObjectURL(url);
    });
  }

  runProcess() {
    if (!this.narsaFile || !this.sageFile) {
      this.message = 'Veuillez sélectionner les deux fichiers Excel';
      return;
    }

    this.service.uploadNarsa(this.narsaFile).subscribe(() => {
      this.service.uploadSage(this.sageFile!).subscribe(() => {
        this.service.compare().subscribe((res) => {
          this.message = res;
          this.loadResults();
        });
      });
    });
  }
}
