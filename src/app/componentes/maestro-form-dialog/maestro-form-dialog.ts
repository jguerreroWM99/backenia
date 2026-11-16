import { Component, Inject, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';

import Swal from 'sweetalert2';
import { MaestrosService } from '../../services/maestrosService';
import { Marca } from '../../models/maestrosModel';

export type TipoMaestro = 'CATEGORIA' | 'MARCA' | 'MODELO';

export interface MaestroDialogData {
  tipo: TipoMaestro;
  usuarioId: number;
  marcas?: Marca[];
}

@Component({
  selector: 'app-maestro-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule
  ],
  templateUrl: './maestro-form-dialog.html',
  styleUrl: './maestro-form-dialog.css'
})
export class MaestroFormDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private maestrosService = inject(MaestrosService);
  private dialogRef = inject(MatDialogRef<MaestroFormDialogComponent>);

  form!: FormGroup;
  guardando = signal<boolean>(false);

  constructor(@Inject(MAT_DIALOG_DATA) public data: MaestroDialogData) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      marcaId: [
        null,
        this.data.tipo === 'MODELO' ? [Validators.required] : []
      ],
      nombre: ['', [Validators.required, Validators.minLength(2)]]
    });
  }

  get titulo(): string {
    if (this.data.tipo === 'CATEGORIA') return 'Registrar Nueva Categoría';
    if (this.data.tipo === 'MARCA') return 'Registrar Nueva Marca';
    return 'Registrar Nuevo Modelo';
  }

  get etiquetaNombre(): string {
    if (this.data.tipo === 'CATEGORIA') return 'Nombre de la Categoría';
    if (this.data.tipo === 'MARCA') return 'Nombre de la Marca';
    return 'Nombre del Modelo';
  }

  get placeholderNombre(): string {
    if (this.data.tipo === 'CATEGORIA') return 'Ej. Monitores, Impresoras, Redes';
    if (this.data.tipo === 'MARCA') return 'Ej. Dell, HP, Lenovo, Logitech';
    return 'Ej. OptiPlex 7090, K120 USB';
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.guardando.set(true);
    const nombre = this.form.value.nombre.trim();

    if (this.data.tipo === 'CATEGORIA') {
      this.maestrosService.crearCategoria({ nombre }, this.data.usuarioId).subscribe({
        next: () => this.finalizarConExito('Categoría registrada'),
        error: () => this.guardando.set(false)
      });
    } else if (this.data.tipo === 'MARCA') {
      this.maestrosService.crearMarca({ nombre }, this.data.usuarioId).subscribe({
        next: () => this.finalizarConExito('Marca registrada'),
        error: () => this.guardando.set(false)
      });
    } else {
      const marcaId = this.form.value.marcaId;
      this.maestrosService.crearModelo({ nombre, marcaId }, this.data.usuarioId).subscribe({
        next: () => this.finalizarConExito('Modelo registrado'),
        error: () => this.guardando.set(false)
      });
    }
  }

  private finalizarConExito(mensaje: string): void {
    this.guardando.set(false);
    Swal.fire({
      icon: 'success',
      title: mensaje,
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 2500
    });
    this.dialogRef.close(true);
  }

  cerrar(): void {
    this.dialogRef.close(false);
  }
}
