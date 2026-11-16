
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Categoria, Marca, Modelo } from '../models/maestrosModel';

@Injectable({
  providedIn: 'root'
})
export class MaestrosService {
  private readonly baseUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  // Categorías
  getCategorias(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(`${this.baseUrl}/categorias`);
  }

  crearCategoria(categoria: Categoria, usuarioId: number): Observable<Categoria> {
    return this.http.post<Categoria>(`${this.baseUrl}/categorias?usuarioId=${usuarioId}`, categoria);
  }

  // Marcas
  getMarcas(): Observable<Marca[]> {
    return this.http.get<Marca[]>(`${this.baseUrl}/marcas`);
  }

  crearMarca(marca: Marca, usuarioId: number): Observable<Marca> {
    return this.http.post<Marca>(`${this.baseUrl}/marcas?usuarioId=${usuarioId}`, marca);
  }

  // Modelos
  getModelos(): Observable<Modelo[]> {
    return this.http.get<Modelo[]>(`${this.baseUrl}/modelos`);
  }

  getModelosPorMarca(marcaId: number): Observable<Modelo[]> {
    return this.http.get<Modelo[]>(`${this.baseUrl}/modelos/marca/${marcaId}`);
  }

  crearModelo(modelo: Modelo, usuarioId: number): Observable<Modelo> {
    return this.http.post<Modelo>(`${this.baseUrl}/modelos?usuarioId=${usuarioId}`, modelo);
  }
}
