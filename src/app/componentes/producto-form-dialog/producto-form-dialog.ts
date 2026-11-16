import { Component, Inject, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import Swal from 'sweetalert2';
import { ProductosService } from '../../services/productosService';
import { MaestrosService } from '../../services/maestrosService';
import { Producto } from '../../models/productoModel';
import { Categoria, Marca, Modelo } from '../../models/maestrosModel';

export interface ProductoDialogData {
  productoEditar?: Producto;
  usuarioId: number;
}

@Component({
  selector: 'app-producto-form-dialog',
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
  templateUrl: './producto-form-dialog.html',
  styleUrl: './producto-form-dialog.css'
})
export class ProductoFormDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private productosService = inject(ProductosService);
  private maestrosService = inject(MaestrosService);
  private dialogRef = inject(MatDialogRef<ProductoFormDialogComponent>);

  productoForm!: FormGroup;
  esEdicion: boolean = false;
  guardando = signal<boolean>(false);

  categorias = signal<Categoria[]>([]);
  marcas = signal<Marca[]>([]);
  modelos = signal<Modelo[]>([]);

  constructor(@Inject(MAT_DIALOG_DATA) public data: ProductoDialogData) {
    this.esEdicion = !!data.productoEditar;
  }

  ngOnInit(): void {
    const p = this.data.productoEditar;

    this.productoForm = this.fb.group({
      nombre: [p?.nombre || '', [Validators.required, Validators.minLength(3)]],
      descripcion: [p?.descripcion || ''],
      categoriaId: [p?.categoriaId || null, [Validators.required]],
      marcaId: [p?.marcaId || null, [Validators.required]],
      modeloId: [p?.modeloId || null, [Validators.required]],
      precio: [p?.precio ?? null, [Validators.required, Validators.min(0.01)]],
      stock: [p?.stock ?? 0, [Validators.required, Validators.min(0)]],
      stockMinimo: [p?.stockMinimo ?? 5, [Validators.required, Validators.min(1)]]
    });

    this.maestrosService.getCategorias().subscribe({
      next: (data) => this.categorias.set(data)
    });

    this.maestrosService.getMarcas().subscribe({
      next: (data) => this.marcas.set(data)
    });

    if (p?.marcaId) {
      this.cargarModelosPorMarca(p.marcaId);
    }
  }

  onMarcaChange(marcaId: number): void {
    this.productoForm.patchValue({ modeloId: null });
    this.modelos.set([]);
    if (marcaId) {
      this.cargarModelosPorMarca(marcaId);
    }
  }

  cargarModelosPorMarca(marcaId: number): void {
    this.maestrosService.getModelosPorMarca(marcaId).subscribe({
      next: (data) => this.modelos.set(data)
    });
  }

  guardar(): void {
    if (this.productoForm.invalid) {
      this.productoForm.markAllAsTouched();
      return;
    }

    this.guardando.set(true);
    const payload: Producto = this.productoForm.value;

    if (this.esEdicion && this.data.productoEditar?.id) {
      this.productosService
        .actualizar(this.data.productoEditar.id, payload, this.data.usuarioId)
        .subscribe({
          next: () => {
            this.guardando.set(false);
            Swal.fire({
              icon: 'success',
              title: 'Producto actualizado',
              toast: true,
              position: 'top-end',
              showConfirmButton: false,
              timer: 2500
            });
            this.dialogRef.close(true);
          },
          error: () => {
            this.guardando.set(false);
          }
        });
    } else {
      this.productosService.crear(payload, this.data.usuarioId).subscribe({
        next: () => {
          this.guardando.set(false);
          Swal.fire({
            icon: 'success',
            title: 'Producto registrado',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 2500
          });
          this.dialogRef.close(true);
        },
        error: () => {
          this.guardando.set(false);
        }
      });
    }
  }

  cerrar(): void {
    this.dialogRef.close(false);
  }
}
