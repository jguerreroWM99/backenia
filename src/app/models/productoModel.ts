export interface Producto {
  id?: number;
  codigo?: string;
  nombre: string;
  descripcion?: string;
  precio: number;
  stock: number;
  stockMinimo: number;
  fechaIngreso?: string;
  activo?: boolean;
  categoriaId: number;
  categoriaNombre?: string;
  marcaId: number;
  marcaNombre?: string;
  modeloId: number;
  modeloNombre?: string;
  alertaStockBajo?: boolean;
}

export interface ProductoFiltros {
  nombre?: string;
  categoriaId?: number | null;
  marcaId?: number | null;
}
