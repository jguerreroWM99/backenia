import { Injectable, signal, WritableSignal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { LoginRequest, LoginResponse } from '../models/authModel';
import { CambiarPasswordRequest, RolUsuario } from '../models/usuarioModel';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth';
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'auth_user';

  usuarioActual: WritableSignal<LoginResponse | null> = signal<LoginResponse | null>(this.obtenerUsuarioStorage());

  constructor(private http: HttpClient, private router: Router) {}

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap((res) => {
        if (res.token) {
          localStorage.setItem(this.TOKEN_KEY, res.token);
        }
        localStorage.setItem(this.USER_KEY, JSON.stringify(res));
        this.usuarioActual.set(res);
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.usuarioActual.set(null);
    this.router.navigate(['/login']);
  }

  recuperarPassword(datos: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/recuperar-password`, datos);
  }

  cambiarPassword(request: CambiarPasswordRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/cambiar-password`, request);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    return !!this.getToken() || !!this.usuarioActual();
  }

  hasRole(rolesPermitidos: (RolUsuario | string)[]): boolean {
    const usuario = this.usuarioActual();
    if (!usuario || !usuario.rol) return false;
    return rolesPermitidos.includes(usuario.rol);
  }

  requiereCambioPassword(): boolean {
    const usuario = this.usuarioActual();
    return usuario?.requiereCambioPassword ?? false;
  }

  private obtenerUsuarioStorage(): LoginResponse | null {
    const userStr = localStorage.getItem(this.USER_KEY);
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }
}
