export type RolUsuario = 'ADMINISTRADOR' | 'SUPERVISOR' | 'COORDINADOR';

export interface Usuario {
  id?: number;
  username: string;
  nombres: string;
  apellidos: string;
  nombreCompleto?: string;
  documentoIdentidad: string;
  fechaNacimiento: string;
  rol: RolUsuario;
  activo?: boolean;
  requiereCambioPassword?: boolean;
  fechaCreacion?: string;
}

export interface UsuarioCreateRequest {
  nombres: string;
  apellidos: string;
  username: string;
  password: string;
  documentoIdentidad: string;
  fechaNacimiento: string;
  rol: RolUsuario;
}

export interface UsuarioUpdateRequest {
  nombres: string;
  apellidos: string;
  documentoIdentidad: string;
  fechaNacimiento: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  id: number;
  username: string;
  nombres: string;
  apellidos: string;
  nombreCompleto: string;
  rol: RolUsuario;
  requiereCambioPassword: boolean;
  mensaje: string;
  token?: string;
  documentoIdentidad?: string;
  fechaNacimiento?: string;
}

export interface CambiarPasswordRequest {
  usuarioId: number;
  passwordActual: string;
  passwordNueva: string;
}

export interface RecuperarPasswordRequest {
  username: string;
  documentoIdentidad: string;
  fechaNacimiento: string;
  nuevaPassword: string;
}

export interface AuthApiResponse {
  mensaje: string;
  exito: boolean;
}
