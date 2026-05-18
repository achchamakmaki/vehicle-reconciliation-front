import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthResponse } from '../../auth/auth.models';
import { AuthService } from '../../auth/auth.service';
import { VehicleReconciliation } from '../../services/vehicle-reconciliation';

interface NavigationItem {
  label: string;
  route?: string;
  action?: 'export' | 'logout';
}

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app-layout.html',
  styleUrl: './app-layout.css',
})
export class AppLayoutComponent {
  currentUser: AuthResponse | null = null;

  navigationItems: NavigationItem[] = [
    { label: 'Dashboard', route: '/dashboard' },
    { label: 'Verification vehicules Sage / NARSA', route: '/reconciliation' },
    { label: 'Liste des vehicules NARSA', route: '/narsa-vehicles' },
    { label: 'Liste des vehicules Sage', route: '/sage-vehicles' },
    { label: 'Resultats de rapprochement', route: '/results' },
    { label: 'Export Excel', action: 'export' },
    { label: 'Historique verifications', route: '/history' },
    { label: 'Parametres', route: '/settings' },
  ];

  constructor(
    private authService: AuthService,
    private reconciliationService: VehicleReconciliation,
  ) {
    this.currentUser = this.authService.getCurrentUser();
  }

  logout() {
    this.authService.logout();
  }

  exportExcel() {
    this.reconciliationService.exportResults().subscribe((file) => {
      const url = window.URL.createObjectURL(file);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'comparison-results.xlsx';
      link.click();
      window.URL.revokeObjectURL(url);
    });
  }
}
