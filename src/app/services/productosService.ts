
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Producto, ProductoFiltros } from '../models/productoModel';

@Injectable({
  providedIn: 'root'
})
export class ProductosService {
  private readonly apiUrl = 'http://localhost:8080/api/productos';

  constructor(private http: HttpClient) {}

  obtenerActivos(): Observable<Producto[]> {
    return this.http.get<Producto[]>(this.apiUrl);
  }

  buscar(filtros: ProductoFiltros): Observable<Producto[]> {
    let params = new HttpParams();
    if (filtros.nombre) params = params.set('nombre', filtros.nombre);
    if (filtros.categoriaId) params = params.set('categoriaId', filtros.categoriaId);
    if (filtros.marcaId) params = params.set('marcaId', filtros.marcaId);

    return this.http.get<Producto[]>(`${this.apiUrl}/buscar`, { params });
  }

  obtenerStockBajo(): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.apiUrl}/stock-bajo`);
  }

  crear(producto: Producto, usuarioId: number): Observable<Producto> {
    return this.http.post<Producto>(`${this.apiUrl}?usuarioId=${usuarioId}`, producto);
  }

  actualizar(id: number, producto: Partial<Producto>, usuarioId: number): Observable<Producto> {
    return this.http.put<Producto>(`${this.apiUrl}/${id}?usuarioId=${usuarioId}`, producto);
  }

  cambiarEstado(id: number, activo: boolean, usuarioId: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/estado?activo=${activo}&usuarioId=${usuarioId}`, {});
  }
}
