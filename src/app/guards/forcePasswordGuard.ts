import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/authService';

export const forcePasswordGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    router.navigate(['/login']);
    return false;
  }

  // Si requiere cambio obligatorio y no está intentando ir a esa pantalla, se le fuerza la redirección
  if (authService.requiereCambioPassword() && state.url !== '/cambiar-password') {
    router.navigate(['/cambiar-password']);
    return false;
  }

  return true;
};
