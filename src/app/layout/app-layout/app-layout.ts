import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app-layout.html',
  styleUrl: './app-layout.css',
})
export class AppLayoutComponent {
  navigationItems = [
    { label: 'Dashboard', route: '/dashboard' },
    { label: 'Vehicules', route: '/vehicles' },
    { label: 'Chauffeurs', route: '/drivers' },
    { label: 'Gestion utilisateurs', route: '/users-management', adminOnly: true },
    { label: 'Rapprochement NARSA / Sage', route: '/reconciliation' },
    { label: 'Infractions routieres', route: '/infractions' },
    { label: 'Consommation gasoil', route: '/fuel-consumptions' },
    { label: 'Rapports', route: '/reports' },
    { label: 'Automatisations n8n', route: '/automations' },
    { label: 'Parametres', route: '/settings' },
  ];

  constructor(
    private router: Router,
    public authService: AuthService,
  ) {}

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
