import { Component } from '@angular/core';
import { VehicleReconciliation, ComparisonResult } from '../../services/vehicle-reconciliation';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reconciliation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reconciliation.html',
  styleUrl: './reconciliation.css'
})
export class ReconciliationComponent {

  narsaFile?: File;
  sageFile?: File;
  results: ComparisonResult[] = [];
  message = '';

  constructor(private service: VehicleReconciliation) {}

  onNarsaFileSelected(event: any) {
    this.narsaFile = event.target.files[0];
  }

  onSageFileSelected(event: any) {
    this.sageFile = event.target.files[0];
  }

  uploadNarsa() {
    if (!this.narsaFile) return;

    this.service.uploadNarsa(this.narsaFile).subscribe(res => {
      this.message = res;
    });
  }

  uploadSage() {
    if (!this.sageFile) return;

    this.service.uploadSage(this.sageFile).subscribe(res => {
      this.message = res;
    });
  }

  compare() {
  this.service.compare().subscribe(res => {
    this.message = res;

    setTimeout(() => {
      this.loadResults();
    }, 500);
  });
}

  loadResults() {
  this.service.getResults().subscribe(data => {
    console.log(data);
    this.results = data;
  });
}

  resetData() {
  this.service.resetData().subscribe(res => {
    this.message = res;
    this.results = [];
    this.narsaFile = undefined;
    this.sageFile = undefined;
  });
}

runProcess() {
  if (!this.narsaFile || !this.sageFile) {
    this.message = 'Veuillez sélectionner les deux fichiers Excel';
    return;
  }

  this.service.uploadNarsa(this.narsaFile).subscribe(() => {
    this.service.uploadSage(this.sageFile!).subscribe(() => {
      this.service.compare().subscribe(res => {
        this.message = res;
        this.loadResults();
      });
    });
  });
}
}