import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  AuthApiResponse,
  RolUsuario,
  Usuario,
  UsuarioCreateRequest,
  UsuarioUpdateRequest
} from '../models/usuarioModel';

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {
  private apiUrl = 'http://localhost:8080/api/usuarios';

  constructor(private http: HttpClient) {}

  listar(solicitanteId: number, username?: string, rol?: RolUsuario | ''): Observable<Usuario[]> {
    let params = new HttpParams().set('solicitanteId', solicitanteId);
    if (username && username.trim() !== '') {
      params = params.set('username', username.trim());
    }
    if (rol) {
      params = params.set('rol', rol);
    }
    return this.http.get<Usuario[]>(this.apiUrl, { params });
  }

  obtenerPorId(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.apiUrl}/${id}`);
  }

  crear(usuario: UsuarioCreateRequest, solicitanteId: number): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.apiUrl}?solicitanteId=${solicitanteId}`, usuario);
  }

  actualizar(id: number, usuario: UsuarioUpdateRequest, solicitanteId: number): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.apiUrl}/${id}?solicitanteId=${solicitanteId}`, usuario);
  }

  cambiarEstado(id: number, activo: boolean, solicitanteId: number): Observable<AuthApiResponse> {
    return this.http.patch<AuthApiResponse>(
      `${this.apiUrl}/${id}/estado?activo=${activo}&solicitanteId=${solicitanteId}`,
      {}
    );
  }

  eliminar(id: number, solicitanteId: number): Observable<AuthApiResponse> {
    return this.http.delete<AuthApiResponse>(`${this.apiUrl}/${id}?solicitanteId=${solicitanteId}`);
  }
}
