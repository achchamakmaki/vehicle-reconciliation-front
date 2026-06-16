import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../auth/auth.service';

interface SidebarItem {
  label: string;
  route: string;
  icon: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  sidebarOpen = false;

  navigationItems: SidebarItem[] = [
    { label: 'Dashboard', route: '/dashboard', icon: 'fa-gauge-high' },
    { label: 'Vehicules', route: '/vehicles', icon: 'fa-car-side' },
    { label: 'Chauffeurs', route: '/drivers', icon: 'fa-id-card' },
    { label: 'Consommation Gasoil', route: '/fuel-consumptions', icon: 'fa-gas-pump' },
    { label: 'Infractions Routieres', route: '/infractions', icon: 'fa-triangle-exclamation' },
    { label: 'Rapprochement NARSA / Sage', route: '/reconciliation', icon: 'fa-right-left' },
    { label: 'Rapports', route: '/reports', icon: 'fa-chart-column' },
    { label: 'Automatisations n8n', route: '/automations', icon: 'fa-diagram-project' },
    { label: 'Parametres', route: '/settings', icon: 'fa-gear' },
  ];

  constructor(
    private router: Router,
    public authService: AuthService,
  ) {}

  get currentUserName(): string {
    return this.authService.getCurrentUser()?.fullName || 'Utilisateur';
  }

  get currentUserRole(): string {
    return this.authService.getCurrentUser()?.role || 'USER';
  }

  get currentUserInitials(): string {
    return this.currentUserName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase() || 'JA';
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  closeSidebar() {
    this.sidebarOpen = false;
  }

  logout() {
    this.authService.logout();
    this.closeSidebar();
    this.router.navigate(['/login']);
  }
}
