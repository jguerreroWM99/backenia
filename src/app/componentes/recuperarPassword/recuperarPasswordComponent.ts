import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon'; // Importado

import Swal from 'sweetalert2';
import { AuthService } from '../../services/authService';

@Component({
  selector: 'app-recuperar-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule // Agregado a imports
  ],
  templateUrl: './recuperarPasswordComponent.html',
  styleUrl: './recuperarPasswordComponent.css'
})
export class recuperarPasswordComponent {
  recuperarForm: FormGroup;
  cargando: boolean = false;
  ocultarPassword: boolean = true; // Propiedad para alternar visibilidad

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.recuperarForm = this.fb.group({
      username: ['', [Validators.required]],
      documentoIdentidad: ['', [Validators.required]],
      fechaNacimiento: ['', [Validators.required]],
      nuevaPassword: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.recuperarForm.invalid) {
      this.recuperarForm.markAllAsTouched();
      return;
    }

    this.cargando = true;

    this.authService.recuperarPassword(this.recuperarForm.value).subscribe({
      next: (res) => {
        this.cargando = false;
        Swal.fire({
          icon: 'success',
          title: '¡Contraseña restablecida!',
          text: res.mensaje || 'Ahora puedes iniciar sesión con tu nueva contraseña.',
          confirmButtonColor: '#0284c7'
        }).then(() => {
          this.router.navigate(['/login']);
        });
      },
      error: () => {
        this.cargando = false;
      }
    });
  }
}
