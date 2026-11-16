import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import Swal from 'sweetalert2';
import { AuthService } from '../services/authService';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let mensajeError = 'Ocurrió un error inesperado en el servidor.';

      if (error.error && typeof error.error.mensaje === 'string') {
        mensajeError = error.error.mensaje;
      } else if (error.status === 401 || error.status === 403) {
        mensajeError = 'No tienes permiso o tu sesión ha expirado.';
        authService.logout();
      } else if (error.status === 0) {
        mensajeError = 'No se puede conectar con el servidor Spring Boot (localhost:8080).';
      }

      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: mensajeError,
        confirmButtonColor: '#0284c7'
      });

      return throwError(() => error);
    })
  );
};
