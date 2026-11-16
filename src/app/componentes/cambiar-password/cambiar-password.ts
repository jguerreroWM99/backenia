import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import Swal from 'sweetalert2';
import { AuthService } from '../../services/authService';

@Component({
  selector: 'app-cambiar-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './cambiar-password.html',
  styleUrl: './cambiar-password.css'
})
export class CambiarPasswordComponent {
  authService = inject(AuthService);
  private fb = inject(FormBuilder);

  form: FormGroup;
  cargando = false;
  ocultarActual = true;
  ocultarNueva = true;
  ocultarConfirmar = true;

  constructor() {
    this.form = this.fb.group(
      {
        passwordActual: ['', [Validators.required]],
        passwordNueva: ['', [Validators.required, Validators.minLength(6)]],
        confirmarPassword: ['', [Validators.required]]
      },
      { validators: this.validarPasswordsIguales }
    );
  }

  private validarPasswordsIguales(group: AbstractControl): ValidationErrors | null {
    const nueva = group.get('passwordNueva')?.value;
    const confirmar = group.get('confirmarPassword')?.value;
    if (nueva && confirmar && nueva !== confirmar) {
      group.get('confirmarPassword')?.setErrors({ noCoincide: true });
      return { noCoincide: true };
    }
    return null;
  }

  onSubmit(): void {
    const sesion = this.authService.usuarioActual();
    if (this.form.invalid || !sesion?.id) {
      this.form.markAllAsTouched();
      return;
    }

    this.cargando = true;
    this.authService
      .cambiarPassword({
        usuarioId: sesion.id,
        passwordActual: this.form.value.passwordActual,
        passwordNueva: this.form.value.passwordNueva
      })
      .subscribe({
        next: () => {
          this.cargando = false;
          Swal.fire({
            icon: 'success',
            title: 'Contraseña actualizada',
            text: 'Inicia sesión nuevamente con tu nueva contraseña.',
            confirmButtonColor: '#0284c7'
          }).then(() => {
            this.authService.logout();
          });
        },
        error: () => {
          this.cargando = false;
        }
      });
  }
}
