import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Usuario } from '../DTOs/usuario.dto';
import { Empresa } from '../DTOs/empresa.dto'; // Ajusta la ruta si es necesario

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private baseUrl = 'http://35.238.19.224:8090/api/usuarios';

  constructor(private http: HttpClient) {}

  // ========== CONSULTAS ==========

  getUsuariosByEmpresaId(empresaId: number): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${this.baseUrl}/empresa/${empresaId}`);
  }

  getEmpresaByUsuarioId(usuarioId: number): Observable<Empresa> {
    return this.http.get<Empresa>(`${this.baseUrl}/${usuarioId}/empresa`).pipe(
      tap(empresa => console.log('✅ Empresa obtenida por usuario ID:', empresa))
    );
  }

  // Obtener todos los usuarios locales (completos)
  getUsuariosLocales(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${this.baseUrl}/local`).pipe(
      tap(users => console.log('✅ Usuarios obtenidos del backend:', users))
    );
  }

  // Sincronizar con Keycloak (solo datos básicos)
  sincronizarConKeycloak(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.baseUrl).pipe(
      tap(users => console.log('✅ Usuarios sincronizados de Keycloak:', users))
    );
  }

  // Obtener usuario por username (datos completos de H2)
  getUsuarioByUsername(username: string): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.baseUrl}/username/${username}`).pipe(
      tap(user => console.log('✅ Usuario obtenido del backend:', user))
    );
  }

  // Obtener usuario por Keycloak ID (datos completos de H2)
  getUsuarioByKeycloakId(keycloakId: string): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.baseUrl}/keycloak/${keycloakId}`).pipe(
      tap(user => console.log('✅ Usuario obtenido por Keycloak ID:', user))
    );
  }

  // Obtener usuario por ID local (datos completos de H2)
  getUsuarioById(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.baseUrl}/${id}`).pipe(
      tap(user => console.log('✅ Usuario obtenido por ID:', user))
    );
  }

  // ========== OPERACIONES CRUD ==========

  // Crear nuevo usuario (ADMIN) - Sincroniza con Keycloak
  crearUsuario(usuario: Partial<Usuario> & { password: string }): Observable<Usuario> {
    return this.http.post<Usuario>(this.baseUrl, usuario).pipe(
      tap(user => console.log('✅ Usuario creado exitosamente:', user))
    );
  }

  // Actualizar usuario existente (ADMIN) - Sincroniza con Keycloak
  actualizarUsuario(id: number, usuario: Partial<Usuario>): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.baseUrl}/${id}`, usuario).pipe(
      tap(user => console.log('✅ Usuario actualizado exitosamente:', user))
    );
  }

  // Eliminar usuario (ADMIN) - Elimina de Keycloak y base de datos local
  eliminarUsuario(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      tap(() => console.log('✅ Usuario eliminado exitosamente, ID:', id))
    );
  }

  // Activar/Desactivar usuario (toggle) - Sincroniza con Keycloak
  toggleActivoUsuario(id: number): Observable<Usuario> {
    return this.http.patch<Usuario>(`${this.baseUrl}/${id}/toggle-active`, {}).pipe(
      tap(user => console.log('✅ Estado de usuario actualizado:', user))
    );
  }

  // Cambiar contraseña de usuario (ADMIN) - Solo en Keycloak
  cambiarPassword(id: number, newPassword: string, temporary: boolean = false): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/password`, {
      newPassword,
      temporary
    }).pipe(
      tap(() => console.log('✅ Contraseña actualizada para usuario ID:', id))
    );
  }
}
