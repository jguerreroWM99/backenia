import { Component, OnInit, inject, signal } from '@angular/core';
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
import { MatTableModule } from '@angular/material/table';

import Swal from 'sweetalert2';
import { AuthService } from '../../services/authService';
import { UsuariosService } from '../../services/usuariosService';
import { HistorialService } from '../../services/historialService';
import { Historial } from '../../models/historialModel';
import { LoginResponse, Usuario } from '../../models/usuarioModel';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule
  ],
  templateUrl: './perfilComponent.html',
  styleUrl: './perfilComponent.css'
})
export class perfilComponent implements OnInit {
  private authService = inject(AuthService);
  private usuariosService = inject(UsuariosService);
  private historialService = inject(HistorialService);
  private fb = inject(FormBuilder);

  usuario = signal<Usuario | null>(null);
  historial = signal<Historial[]>([]);
  cargandoPassword = signal<boolean>(false);

  passwordForm: FormGroup;
  ocultarPasswordActual: boolean = true;
  ocultarPasswordNueva: boolean = true;
  ocultarConfirmarPassword: boolean = true;

  columnasHistorial: string[] = ['fecha', 'accion', 'descripcion', 'usuario'];

  constructor() {
    this.passwordForm = this.fb.group(
      {
        passwordActual: ['', [Validators.required]],
        passwordNueva: ['', [Validators.required, Validators.minLength(6)]],
        confirmarPassword: ['', [Validators.required]]
      },
      { validators: this.validarPasswordsIguales }
    );
  }

  ngOnInit(): void {
    this.cargarDatosUsuario();
    this.cargarHistorial();
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

  cargarDatosUsuario(): void {
    const sesion: LoginResponse | null = this.authService.usuarioActual();
    if (!sesion) return;

    this.usuario.set({
      id: sesion.id,
      username: sesion.username,
      nombres: sesion.nombres || '',
      apellidos: sesion.apellidos || '',
      nombreCompleto: sesion.nombreCompleto || 'Usuario',
      rol: sesion.rol,
      documentoIdentidad: sesion.documentoIdentidad || 'Sin registrar',
      fechaNacimiento: sesion.fechaNacimiento || ''
    });

    if (sesion.id) {
      this.usuariosService.obtenerPorId(sesion.id).subscribe({
        next: (data: Usuario) => {
          if (data) {
            this.usuario.set({
              ...data,
              nombreCompleto:
                data.nombreCompleto ||
                `${data.nombres || ''} ${data.apellidos || ''}`.trim() ||
                sesion.nombreCompleto
            });
          }
        }
      });
    }
  }

  cargarHistorial(): void {
    const sesion: LoginResponse | null = this.authService.usuarioActual();
    if (!sesion || !sesion.id) return;

    this.historialService.obtenerHistorialPorUsuario(sesion.id).subscribe({
      next: (data: Historial[]) => {
        this.historial.set(data);
      }
    });
  }

  onChangePassword(): void {
    const user = this.usuario();
    if (this.passwordForm.invalid || !user || !user.id) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    this.cargandoPassword.set(true);

    this.authService
      .cambiarPassword({
        usuarioId: user.id,
        passwordActual: this.passwordForm.value.passwordActual,
        passwordNueva: this.passwordForm.value.passwordNueva
      })
      .subscribe({
        next: () => {
          this.cargandoPassword.set(false);
          Swal.fire({
            icon: 'success',
            title: 'Contraseña actualizada',
            text: 'Por favor inicia sesión con tu nueva contraseña.',
            confirmButtonColor: '#0284c7'
          }).then(() => {
            this.authService.logout();
          });
        },
        error: () => {
          this.cargandoPassword.set(false);
        }
      });
  }
}
