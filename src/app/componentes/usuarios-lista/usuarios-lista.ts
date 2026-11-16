import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';

import Swal from 'sweetalert2';
import { AuthService } from '../../services/authService';
import { UsuariosService } from '../../services/usuariosService';
import { HasRoleDirective } from '../../directives/hasRoleDirective';
import { LoginResponse, RolUsuario, Usuario } from '../../models/usuarioModel';
import { UsuarioFormDialogComponent } from '../usuario-form-dialog/usuario-form-dialog';

@Component({
  selector: 'app-usuarios-lista',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatDialogModule,
    MatTooltipModule,
    HasRoleDirective
  ],
  templateUrl: './usuarios-lista.html',
  styleUrl: './usuarios-lista.css'
})
export class UsuariosListaComponent implements OnInit {
  private authService = inject(AuthService);
  private usuariosService = inject(UsuariosService);
  private dialog = inject(MatDialog);

  sesion: LoginResponse | null = null;
  usuarios = signal<Usuario[]>([]);
  cargando = signal<boolean>(false);

  filtroUsername: string = '';
  filtroRol: RolUsuario | '' = '';
  rolesFiltro: RolUsuario[] = [];

  columnas: string[] = [];

  ngOnInit(): void {
    this.sesion = this.authService.usuarioActual();
    if (!this.sesion) return;

    if (this.sesion.rol === 'ADMINISTRADOR') {
      this.rolesFiltro = ['ADMINISTRADOR', 'SUPERVISOR', 'COORDINADOR'];
    } else {
      this.rolesFiltro = ['SUPERVISOR', 'COORDINADOR'];
    }

    if (this.sesion.rol === 'COORDINADOR') {
      this.columnas = ['username', 'nombreCompleto', 'documentoIdentidad', 'rol', 'estado'];
    } else {
      this.columnas = ['username', 'nombreCompleto', 'documentoIdentidad', 'rol', 'estado', 'acciones'];
    }

    this.buscarUsuarios();
  }

  buscarUsuarios(): void {
    if (!this.sesion?.id) return;
    this.cargando.set(true);

    this.usuariosService.listar(this.sesion.id, this.filtroUsername, this.filtroRol).subscribe({
      next: (data) => {
        this.usuarios.set(data);
        this.cargando.set(false);
      },
      error: () => {
        this.cargando.set(false);
      }
    });
  }

  limpiarFiltros(): void {
    this.filtroUsername = '';
    this.filtroRol = '';
    this.buscarUsuarios();
  }

  puedeGestionar(objetivo: Usuario): boolean {
    if (!this.sesion) return false;
    if (this.sesion.rol === 'ADMINISTRADOR') {
      return objetivo.rol !== 'ADMINISTRADOR';
    }
    if (this.sesion.rol === 'SUPERVISOR') {
      return objetivo.rol === 'COORDINADOR';
    }
    return false;
  }

  abrirModalCrear(): void {
    if (!this.sesion?.id) return;

    const ref = this.dialog.open(UsuarioFormDialogComponent, {
      width: '560px',
      data: {
        solicitanteId: this.sesion.id,
        solicitanteRol: this.sesion.rol
      }
    });

    ref.afterClosed().subscribe((guardado) => {
      if (guardado) this.buscarUsuarios();
    });
  }

  abrirModalEditar(usuario: Usuario): void {
    if (!this.sesion?.id || !this.puedeGestionar(usuario)) return;

    const ref = this.dialog.open(UsuarioFormDialogComponent, {
      width: '560px',
      data: {
        usuarioEditar: usuario,
        solicitanteId: this.sesion.id,
        solicitanteRol: this.sesion.rol
      }
    });

    ref.afterClosed().subscribe((guardado) => {
      if (guardado) this.buscarUsuarios();
    });
  }

  alternarEstado(usuario: Usuario): void {
    if (!this.sesion?.id || !usuario.id || !this.puedeGestionar(usuario)) return;

    const nuevoEstado = !usuario.activo;
    const verbo = nuevoEstado ? 'activar' : 'desactivar';

    Swal.fire({
      title: `¿Deseas ${verbo} esta cuenta?`,
      text: `Usuario: ${usuario.username} (${usuario.rol})`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#0284c7',
      cancelButtonColor: '#64748b',
      confirmButtonText: `Sí, ${verbo}`,
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed && this.sesion?.id && usuario.id) {
        this.usuariosService.cambiarEstado(usuario.id, nuevoEstado, this.sesion.id).subscribe({
          next: (res) => {
            Swal.fire({
              icon: 'success',
              title: res.mensaje,
              toast: true,
              position: 'top-end',
              showConfirmButton: false,
              timer: 2500
            });
            this.buscarUsuarios();
          }
        });
      }
    });
  }

  eliminarUsuario(usuario: Usuario): void {
    if (!this.sesion?.id || !usuario.id || !this.puedeGestionar(usuario)) return;

    Swal.fire({
      title: '¿Eliminar usuario permanentemente?',
      text: `Se eliminará la cuenta de ${usuario.username}. Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed && this.sesion?.id && usuario.id) {
        this.usuariosService.eliminar(usuario.id, this.sesion.id).subscribe({
          next: (res) => {
            Swal.fire({
              icon: 'success',
              title: res.mensaje,
              toast: true,
              position: 'top-end',
              showConfirmButton: false,
              timer: 2500
            });
            this.buscarUsuarios();
          }
        });
      }
    });
  }
}
