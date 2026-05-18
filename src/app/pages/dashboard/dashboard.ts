import { Component } from '@angular/core';
import { ReconciliationComponent } from '../reconciliation/reconciliation';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [ReconciliationComponent],
  templateUrl: './dashboard.html',
})
export class DashboardComponent {}
