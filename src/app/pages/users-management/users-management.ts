import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, DestroyRef, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { NavigationEnd, Router } from '@angular/router';
import { finalize, switchMap, tap } from 'rxjs';
import { filter } from 'rxjs';
import { AuthService } from '../../auth/auth.service';
import { ManagedUser, UserRequest, UsersAdminApiService } from '../../services/users-admin-api';

@Component({
  selector: 'app-users-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users-management.html',
  styleUrl: './users-management.css',
})
export class UsersManagementComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  @ViewChild('userFormPanel') userFormPanel?: ElementRef<HTMLElement>;

  users: ManagedUser[] = [];
  searchTerm = '';
  roleFilter = 'ALL';
  page = 1;
  pageSize = 6;
  message = '';
  errorMessage = '';
  formVisible = false;
  saving = false;
  loadingUsers = false;
  deletingUserIds = new Set<number>();
  editingUser?: ManagedUser;

  form: UserRequest = this.emptyForm();

  constructor(
    private usersApi: UsersAdminApiService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.loadUsers();
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      filter((event) => event.urlAfterRedirects.startsWith('/users-management')),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(() => this.loadUsers());
  }

  get filteredUsers() {
    const term = this.searchTerm.trim().toLowerCase();

    return this.users.filter((user) => {
      const matchesSearch =
        !term ||
        user.fullName?.toLowerCase().includes(term) ||
        user.email?.toLowerCase().includes(term);
      const matchesRole = this.roleFilter === 'ALL' || user.role === this.roleFilter;
      return matchesSearch && matchesRole;
    });
  }

  get paginatedUsers() {
    const start = (this.page - 1) * this.pageSize;
    return this.filteredUsers.slice(start, start + this.pageSize);
  }

  get totalPages() {
    return Math.max(1, Math.ceil(this.filteredUsers.length / this.pageSize));
  }

  get activeUsersCount() {
    return this.users.filter((user) => user.active).length;
  }

  get adminUsersCount() {
    return this.users.filter((user) => user.role === 'ADMIN').length;
  }

  get inactiveUsersCount() {
    return this.users.filter((user) => !user.active).length;
  }

  loadUsers() {
    this.loadingUsers = true;
    this.errorMessage = '';

    this.authService.refreshCurrentUser().pipe(
      switchMap(() => this.usersApi.findAll()),
      finalize(() => {
        this.loadingUsers = false;
        this.cdr.detectChanges();
      }),
    ).subscribe({
      next: (users) => {
        this.replaceUsers(users);
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage = error.status === 403
          ? 'Session expiree, veuillez vous reconnecter.'
          : 'Impossible de charger les utilisateurs.';
      },
    });
  }

  openCreateForm() {
    this.editingUser = undefined;
    this.form = this.emptyForm();
    this.formVisible = true;
    this.clearMessages();
    this.scrollToForm();
  }

  edit(user: ManagedUser) {
    this.editingUser = user;
    this.form = {
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      active: user.active,
      password: '',
    };
    this.formVisible = true;
    this.clearMessages();
    this.scrollToForm();
  }

  save() {
    this.clearMessages();

    if (!this.form.fullName || !this.form.email) {
      this.errorMessage = 'Nom complet et email sont obligatoires.';
      return;
    }

    if (!this.editingUser && !this.form.password) {
      this.errorMessage = 'Mot de passe obligatoire pour creer un utilisateur.';
      return;
    }

    const request = this.editingUser
      ? this.usersApi.update(this.editingUser.id, this.form)
      : this.usersApi.create(this.form);

    this.saving = true;

    request.pipe(
      finalize(() => {
        this.saving = false;
      }),
    ).subscribe({
      next: (savedUser) => {
        this.message = this.editingUser ? 'Utilisateur modifie avec succes.' : 'Utilisateur cree avec succes.';
        this.upsertUser(savedUser);
        this.formVisible = false;
        this.form = this.emptyForm();
        this.editingUser = undefined;
      },
      error: () => {
        this.errorMessage = 'Operation impossible. Verifiez email unique et droits ADMIN.';
      },
    });
  }

  toggleStatus(user: ManagedUser) {
    this.clearMessages();

    this.usersApi.toggleStatus(user.id).subscribe({
      next: () => {
        this.message = 'Statut utilisateur mis a jour.';
        this.loadUsers();
      },
      error: () => {
        this.errorMessage = 'Impossible de modifier le statut.';
      },
    });
  }

  resetPassword(user: ManagedUser) {
    this.clearMessages();
    const password = window.prompt(`Nouveau mot de passe pour ${user.fullName}`);

    if (!password) {
      return;
    }

    this.usersApi.resetPassword(user.id, password).subscribe({
      next: () => {
        this.message = 'Mot de passe reinitialise.';
      },
      error: () => {
        this.errorMessage = 'Impossible de reinitialiser le mot de passe.';
      },
    });
  }

  delete(user: ManagedUser) {
    this.clearMessages();

    if (!window.confirm(`Supprimer l'utilisateur ${user.fullName} ?`)) {
      return;
    }

    this.deletingUserIds.add(user.id);

    this.usersApi.delete(user.id).pipe(
      tap(() => {
        this.users = this.users.filter((currentUser) => currentUser.id !== user.id);
        this.normalizePage();
        this.message = 'Utilisateur supprime.';
      }),
      switchMap(() => this.usersApi.findAll()),
      finalize(() => {
        this.deletingUserIds.delete(user.id);
      }),
    ).subscribe({
      next: (users) => {
        this.replaceUsers(users);
      },
      error: () => {
        this.errorMessage = 'Suppression impossible cote serveur. Verifiez que vous etes ADMIN et que le backend est bien demarre.';
      },
    });
  }

  setPage(page: number) {
    this.page = Math.min(Math.max(page, 1), this.totalPages);
  }

  onFiltersChange() {
    this.page = 1;
  }

  private clearMessages() {
    this.message = '';
    this.errorMessage = '';
  }

  isDeleting(user: ManagedUser) {
    return this.deletingUserIds.has(user.id);
  }

  private replaceUsers(users: ManagedUser[]) {
    this.users = users;
    this.normalizePage();
  }

  private normalizePage() {
    this.page = Math.min(Math.max(this.page, 1), this.totalPages);
  }

  private upsertUser(user: ManagedUser) {
    const index = this.users.findIndex((currentUser) => currentUser.id === user.id);

    if (index >= 0) {
      this.users = this.users.map((currentUser) => currentUser.id === user.id ? user : currentUser);
    } else {
      this.users = [user, ...this.users];
    }

    this.normalizePage();
  }

  private scrollToForm() {
    setTimeout(() => {
      this.userFormPanel?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  private emptyForm(): UserRequest {
    return {
      fullName: '',
      email: '',
      password: '',
      role: 'USER',
      active: true,
    };
  }
}
