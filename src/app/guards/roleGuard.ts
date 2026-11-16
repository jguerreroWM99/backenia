import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/authService';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const rolesPermitidos = route.data?.['roles'] as Array<string>;

  if (authService.isLoggedIn() && authService.hasRole(rolesPermitidos)) {
    return true;
  }

  router.navigate(['/almacen/productos']);
  return false;
};
