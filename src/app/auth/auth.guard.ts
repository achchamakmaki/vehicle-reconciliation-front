import { inject } from '@angular/core';
import { CanActivateChildFn, CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { AuthService } from './auth.service';

const canAccess = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree(['/login']);
};

export const authGuard: CanActivateFn = () => canAccess();

export const authChildGuard: CanActivateChildFn = () => canAccess();

export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return router.createUrlTree(['/login']);
  }

  return authService.refreshCurrentUser().pipe(
    map(() => authService.isAdmin() ? true : router.createUrlTree(['/dashboard'])),
    catchError(() => of(router.createUrlTree(['/login']))),
  );
};
