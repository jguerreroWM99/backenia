import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Historial } from '../models/historialModel';

@Injectable({
  providedIn: 'root'
})
export class HistorialService {
  private apiUrl = 'http://localhost:8080/api/historial';

  constructor(private http: HttpClient) {}

  obtenerHistorialPorUsuario(usuarioId: number): Observable<Historial[]> {
    return this.http.get<Historial[]>(`${this.apiUrl}/usuario/${usuarioId}`);
  }
}
