import { Component, Inject, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import Swal from 'sweetalert2';
import { UsuariosService } from '../../services/usuariosService';
import { RolUsuario, Usuario } from '../../models/usuarioModel';

export interface UsuarioDialogData {
  usuarioEditar?: Usuario;
  solicitanteId: number;
  solicitanteRol: RolUsuario;
}

@Component({
  selector: 'app-usuario-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './usuario-form-dialog.html',
  styleUrl: './usuario-form-dialog.css'
})
export class UsuarioFormDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private usuariosService = inject(UsuariosService);
  private dialogRef = inject(MatDialogRef<UsuarioFormDialogComponent>);

  usuarioForm!: FormGroup;
  esEdicion: boolean = false;
  guardando: boolean = false;
  ocultarPassword: boolean = true;
  rolesDisponibles: RolUsuario[] = [];

  constructor(@Inject(MAT_DIALOG_DATA) public data: UsuarioDialogData) {
    this.esEdicion = !!data.usuarioEditar;
  }

  ngOnInit(): void {
    if (this.esEdicion && this.data.usuarioEditar) {
      this.rolesDisponibles = [this.data.usuarioEditar.rol];
    } else if (this.data.solicitanteRol === 'ADMINISTRADOR') {
      this.rolesDisponibles = ['SUPERVISOR', 'COORDINADOR'];
    } else {
      this.rolesDisponibles = ['COORDINADOR'];
    }

    const u = this.data.usuarioEditar;

    this.usuarioForm = this.fb.group({
      nombres: [u?.nombres || '', [Validators.required]],
      apellidos: [u?.apellidos || '', [Validators.required]],
      documentoIdentidad: [u?.documentoIdentidad || '', [Validators.required, Validators.minLength(8)]],
      fechaNacimiento: [u?.fechaNacimiento || '', [Validators.required]],
      username: [
        u?.username || '',
        this.esEdicion ? [] : [Validators.required, Validators.minLength(4)]
      ],
      rol: [
        u?.rol || (this.rolesDisponibles.length === 1 ? this.rolesDisponibles[0] : ''),
        this.esEdicion ? [] : [Validators.required]
      ],
      password: ['', this.esEdicion ? [] : [Validators.required, Validators.minLength(6)]]
    });
  }

  guardar(): void {
    if (this.usuarioForm.invalid) {
      this.usuarioForm.markAllAsTouched();
      return;
    }

    this.guardando = true;
    const val = this.usuarioForm.getRawValue();

    if (this.esEdicion && this.data.usuarioEditar?.id) {
      this.usuariosService
        .actualizar(
          this.data.usuarioEditar.id,
          {
            nombres: val.nombres,
            apellidos: val.apellidos,
            documentoIdentidad: val.documentoIdentidad,
            fechaNacimiento: val.fechaNacimiento
          },
          this.data.solicitanteId
        )
        .subscribe({
          next: () => {
            this.guardando = false;
            Swal.fire({
              icon: 'success',
              title: 'Usuario actualizado',
              toast: true,
              position: 'top-end',
              showConfirmButton: false,
              timer: 2500
            });
            this.dialogRef.close(true);
          },
          error: () => {
            this.guardando = false;
          }
        });
    } else {
      this.usuariosService
        .crear(
          {
            nombres: val.nombres,
            apellidos: val.apellidos,
            username: val.username,
            password: val.password,
            documentoIdentidad: val.documentoIdentidad,
            fechaNacimiento: val.fechaNacimiento,
            rol: val.rol
          },
          this.data.solicitanteId
        )
        .subscribe({
          next: () => {
            this.guardando = false;
            Swal.fire({
              icon: 'success',
              title: 'Usuario creado correctamente',
              toast: true,
              position: 'top-end',
              showConfirmButton: false,
              timer: 2500
            });
            this.dialogRef.close(true);
          },
          error: () => {
            this.guardando = false;
          }
        });
    }
  }

  cerrar(): void {
    this.dialogRef.close(false);
  }
}
