import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class RegisterComponent {
  fullName = '';
  email = '';
  password = '';
  role = 'USER';
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  register() {
    this.errorMessage = '';

    this.authService
      .register({
        fullName: this.fullName,
        email: this.email,
        password: this.password,
        role: this.role,
      })
      .subscribe({
        next: () => this.router.navigate(['/dashboard']),
        error: () => {
          this.errorMessage = 'Creation de compte impossible';
        },
      });
  }
}
