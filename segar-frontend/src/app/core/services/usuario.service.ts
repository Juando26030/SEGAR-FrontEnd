import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap, catchError } from 'rxjs';
import { Usuario } from '../DTOs/usuario.dto';
import { Empresa } from '../DTOs/empresa.dto';
import { environment } from '../../../environments/environment';
import { map } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private baseUrl = `${environment.apiUrl}/api/usuarios`;


  constructor(private http: HttpClient) {}

  // ========== CONSULTAS ==========

  esAdmin(usuarioId: number, token: string): Observable<boolean> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<Usuario>(`${this.baseUrl}/${usuarioId}`, { headers }).pipe(
      map(usuario => usuario.role === 'Administrador')
    );
  }


  getUsuariosByEmpresaId(empresaId: number, token: string): Observable<Usuario[]> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<Usuario[]>(`${this.baseUrl}/empresa/${empresaId}`, { headers });
  }

  getEmpresaByUsuarioId(usuarioId: number, token: string): Observable<Empresa> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<Empresa>(`${this.baseUrl}/${usuarioId}/empresa`, { headers }).pipe(
      tap(empresa => console.log('✅ Empresa obtenida por usuario ID:', empresa))
    );
  }

  // Obtener todos los usuarios locales (completos)
  getUsuariosLocales(token: string): Observable<Usuario[]> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<Usuario[]>(`${this.baseUrl}/local`, { headers }).pipe(
      tap(users => console.log('✅ Usuarios obtenidos del backend:', users))
    );
  }

  // Sincronizar con Keycloak (solo datos básicos)
  sincronizarConKeycloak(token: string): Observable<Usuario[]> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<Usuario[]>(this.baseUrl, { headers }).pipe(
      tap(users => console.log('✅ Usuarios sincronizados de Keycloak:', users))
    );
  }

  // Obtener usuario por username (datos completos de H2)
  getUsuarioByUsername(username: string, token: string): Observable<Usuario> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<Usuario>(`${this.baseUrl}/username/${username}`, { headers }).pipe(
      tap(user => console.log('✅ Usuario obtenido del backend:', user))
    );
  }

  // Obtener usuario por Keycloak ID (datos completos de H2)
  getUsuarioByKeycloakId(keycloakId: string, token: string): Observable<Usuario> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<Usuario>(`${this.baseUrl}/keycloak/${keycloakId}`, { headers }).pipe(
      tap(user => console.log('✅ Usuario obtenido por Keycloak ID:', user))
    );
  }

  // Obtener usuario por ID local (datos completos de H2)
  getUsuarioById(id: number, token: string): Observable<Usuario> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<Usuario>(`${this.baseUrl}/${id}`, { headers }).pipe(
      tap(user => console.log('✅ Usuario obtenido por ID:', user))
    );
  }

  // ========== OPERACIONES CRUD ==========

  // Crear nuevo usuario (ADMIN) - Sincroniza con Keycloak
  crearUsuario(usuario: Partial<Usuario> & { password: string }, token: string): Observable<Usuario> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.post<Usuario>(this.baseUrl, usuario, { headers }).pipe(
      tap(user => console.log('✅ Usuario creado exitosamente:', user))
    );
  }

  // Actualizar usuario existente (ADMIN) - Sincroniza con Keycloak
  actualizarUsuario(id: number, usuario: Partial<Usuario>, token: string): Observable<Usuario> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.put<Usuario>(`${this.baseUrl}/${id}`, usuario, { headers }).pipe(
      tap(user => console.log('✅ Usuario actualizado exitosamente:', user))
    );
  }

  // Eliminar usuario (ADMIN) - Elimina de Keycloak y base de datos local
  eliminarUsuario(id: number, token: string): Observable<void> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.delete<void>(`${this.baseUrl}/${id}`, { headers }).pipe(
      tap(() => console.log('✅ Usuario eliminado exitosamente, ID:', id))
    );
  }

  // Activar/Desactivar usuario (toggle) - Sincroniza con Keycloak
  toggleActivoUsuario(id: number, token: string): Observable<Usuario> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.patch<Usuario>(`${this.baseUrl}/${id}/toggle-active`, {}, { headers }).pipe(
      tap(user => console.log('✅ Estado de usuario actualizado:', user))
    );
  }

  // Cambiar contraseña de usuario (ADMIN) - Solo en Keycloak
  cambiarPassword(id: number, newPassword: string, temporary: boolean = false, token: string): Observable<void> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    const url = `${this.baseUrl}/${id}/password`;
    const body = { newPassword, temporary };

    console.log('🔐 Enviando petición de cambio de contraseña:');
    console.log('   URL:', url);
    console.log('   Body:', { newPassword: '***', temporary });

    return this.http.patch<void>(url, body, { headers }).pipe(
      tap(() => {
        console.log('✅ Contraseña actualizada exitosamente para usuario ID:', id);
      }),
      catchError(error => {
        console.error('❌ Error en servicio cambiarPassword:', error);
        throw error;
      })
    );
  }
}
