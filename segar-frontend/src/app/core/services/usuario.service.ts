import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable,tap } from 'rxjs';
import { Usuario } from '../DTOs/usuario.dto';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private apiUrl = 'http://localhost:8090/api/usuarios';

  constructor(private http: HttpClient) {}

  // Obtener usuario por username (datos completos de H2)
  getUsuarioByUsername(username: string): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.apiUrl}/username/${username}`).pipe(
      tap(user => console.log('✅ Usuario obtenido del backend:', user))
    );
  }

  // Obtener usuario por Keycloak ID (datos completos de H2)
  getUsuarioByKeycloakId(keycloakId: string): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.apiUrl}/keycloak/${keycloakId}`);
  }

  // Obtener usuario por ID local (datos completos de H2)
  getUsuarioById(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.apiUrl}/${id}`);
  }

  // Obtener todos los usuarios locales (completos)
  getUsuariosLocales(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${this.apiUrl}/local`);
  }

  // Sincronizar con Keycloak (solo datos básicos)
  sincronizarConKeycloak(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.apiUrl);
  }

  // Crear nuevo usuario (ADMIN)
  crearUsuario(usuario: Usuario): Observable<Usuario> {
    return this.http.post<Usuario>(this.apiUrl, usuario);
  }
}
