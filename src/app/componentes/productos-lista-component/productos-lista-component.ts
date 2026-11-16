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
import { ProductosService } from '../../services/productosService';
import { MaestrosService } from '../../services/maestrosService';
import { StockBajoDirective } from '../../directives/stockBajoDirective';
import { HasRoleDirective } from '../../directives/hasRoleDirective';
import { Producto } from '../../models/productoModel';
import { Categoria, Marca } from '../../models/maestrosModel';
import { LoginResponse } from '../../models/usuarioModel';
import { ProductoFormDialogComponent } from '../producto-form-dialog/producto-form-dialog';
import { MaestroFormDialogComponent } from '../maestro-form-dialog/maestro-form-dialog';

@Component({
  selector: 'app-productos-lista',
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
    StockBajoDirective,
    HasRoleDirective
  ],
  templateUrl: './productos-lista-component.html',
  styleUrl: './productos-lista-component.css'
})
export class productosListaComponent implements OnInit {
  private authService = inject(AuthService);
  private productosService = inject(ProductosService);
  private maestrosService = inject(MaestrosService);
  private dialog = inject(MatDialog);

  sesion: LoginResponse | null = null;
  productos = signal<Producto[]>([]);
  categorias = signal<Categoria[]>([]);
  marcas = signal<Marca[]>([]);

  filtroNombre: string = '';
  filtroCategoriaId: number | null = null;
  filtroMarcaId: number | null = null;

  soloStockBajo = signal<boolean>(false);
  cargando = signal<boolean>(false);
  totalStockBajo = signal<number>(0);

  columnas: string[] = [
    'codigo',
    'nombre',
    'categoria',
    'marcaModelo',
    'precio',
    'stock',
    'acciones'
  ];

  ngOnInit(): void {
    this.sesion = this.authService.usuarioActual();
    this.cargarMaestros();
    this.cargarProductos();
  }

  cargarMaestros(): void {
    this.maestrosService.getCategorias().subscribe({
      next: (data) => this.categorias.set(data)
    });
    this.maestrosService.getMarcas().subscribe({
      next: (data) => this.marcas.set(data)
    });
  }

  cargarProductos(): void {
    this.cargando.set(true);
    this.soloStockBajo.set(false);

    const hayFiltros =
      this.filtroNombre.trim() !== '' ||
      this.filtroCategoriaId !== null ||
      this.filtroMarcaId !== null;

    const peticion$ = hayFiltros
      ? this.productosService.buscar({
          nombre: this.filtroNombre.trim() || undefined,
          categoriaId: this.filtroCategoriaId || undefined,
          marcaId: this.filtroMarcaId || undefined
        })
      : this.productosService.obtenerActivos();

    peticion$.subscribe({
      next: (data) => {
        this.productos.set(data);
        const criticos = data.filter(
          (p) => p.alertaStockBajo || p.stock <= p.stockMinimo
        ).length;
        this.totalStockBajo.set(criticos);
        this.cargando.set(false);
      },
      error: () => {
        this.cargando.set(false);
      }
    });
  }

  filtrarStockBajo(): void {
    if (this.soloStockBajo()) {
      this.cargarProductos();
      return;
    }

    this.cargando.set(true);
    this.soloStockBajo.set(true);
    this.productosService.obtenerStockBajo().subscribe({
      next: (data) => {
        this.productos.set(data);
        this.totalStockBajo.set(data.length);
        this.cargando.set(false);
      },
      error: () => {
        this.cargando.set(false);
      }
    });
  }

  limpiarFiltros(): void {
    this.filtroNombre = '';
    this.filtroCategoriaId = null;
    this.filtroMarcaId = null;
    this.cargarProductos();
  }

  // --- Modales de Catálogos (Categoría, Marca y Modelo) ---

  registrarCategoria(): void {
    if (!this.sesion?.id) return;

    const ref = this.dialog.open(MaestroFormDialogComponent, {
      width: '440px',
      data: {
        tipo: 'CATEGORIA',
        usuarioId: this.sesion.id
      }
    });

    ref.afterClosed().subscribe((guardado) => {
      if (guardado) this.cargarMaestros();
    });
  }

  registrarMarca(): void {
    if (!this.sesion?.id) return;

    const ref = this.dialog.open(MaestroFormDialogComponent, {
      width: '440px',
      data: {
        tipo: 'MARCA',
        usuarioId: this.sesion.id
      }
    });

    ref.afterClosed().subscribe((guardado) => {
      if (guardado) this.cargarMaestros();
    });
  }

  registrarModelo(): void {
    if (!this.sesion?.id) return;

    const listaMarcas = this.marcas();
    if (listaMarcas.length === 0) {
      Swal.fire({
        icon: 'info',
        title: 'Primero registra una marca',
        text: 'Necesitas tener al menos una marca creada para asociarle un modelo.',
        confirmButtonColor: '#0284c7'
      });
      return;
    }

    const ref = this.dialog.open(MaestroFormDialogComponent, {
      width: '440px',
      data: {
        tipo: 'MODELO',
        usuarioId: this.sesion.id,
        marcas: listaMarcas
      }
    });

    ref.afterClosed().subscribe((guardado) => {
      if (guardado) this.cargarMaestros();
    });
  }

  // --- Modales de Producto ---

  abrirModalCrear(): void {
    if (!this.sesion?.id) return;

    const ref = this.dialog.open(ProductoFormDialogComponent, {
      width: '580px',
      data: { usuarioId: this.sesion.id }
    });

    ref.afterClosed().subscribe((guardado) => {
      if (guardado) this.cargarProductos();
    });
  }

  abrirModalEditar(producto: Producto): void {
    if (!this.sesion?.id) return;

    const ref = this.dialog.open(ProductoFormDialogComponent, {
      width: '580px',
      data: {
        productoEditar: producto,
        usuarioId: this.sesion.id
      }
    });

    ref.afterClosed().subscribe((guardado) => {
      if (guardado) this.cargarProductos();
    });
  }

  darDeBaja(producto: Producto): void {
    if (!this.sesion?.id || !producto.id) return;

    Swal.fire({
      title: '¿Dar de baja este producto?',
      text: `Se desactivará "${producto.nombre}" (${producto.codigo}) del inventario activo.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Sí, desactivar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed && this.sesion?.id && producto.id) {
        this.productosService.cambiarEstado(producto.id, false, this.sesion.id).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Producto desactivado del inventario',
              toast: true,
              position: 'top-end',
              showConfirmButton: false,
              timer: 2500
            });
            this.cargarProductos();
          }
        });
      }
    });
  }
}
