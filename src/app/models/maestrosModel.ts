export interface Categoria {
  id?: number;
  nombre: string;
  descripcion?: string;
}

export interface Marca {
  id?: number;
  nombre: string;
}

export interface Modelo {
  id?: number;
  nombre: string;
  descripcion?: string;
  marcaId: number;
  marcaNombre?: string;
}
