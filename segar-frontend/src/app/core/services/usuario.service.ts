import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Usuario {
  id?: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  enabled: boolean;
  roles: string[];
}

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private baseUrl = 'http://35.238.19.224:8090/api';

  constructor(private http: HttpClient) {}

  // Métodos solo disponibles para administradores
  getUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${this.baseUrl}/admin/users`);
  }

  crearUsuario(usuario: Usuario): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.baseUrl}/admin/users`, usuario);
  }

  actualizarUsuario(id: string, usuario: Usuario): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.baseUrl}/admin/users/${id}`, usuario);
  }

  eliminarUsuario(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/admin/users/${id}`);
  }

  // Método disponible para todos los usuarios autenticados
  obtenerPerfil(): Observable<any> {
    return this.http.get(`${this.baseUrl}/usuarios/perfil`);
  }
}
