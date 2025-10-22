import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuarioService } from '../../core/services/usuario.service';
import { Usuario } from '../../core/DTOs/usuario.dto';
import { AuthService } from '../../auth/services/auth.service';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container mx-auto p-6">
      <div class="mb-6">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Gestión de Usuarios</h1>
        <p class="text-gray-600">Panel de administración - Solo para administradores</p>
      </div>

      <!-- Verificación de permisos -->
      <div *ngIf="!authService.isAdmin()" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        <p class="font-bold">Acceso denegado:</p>
        <p>Esta funcionalidad está disponible solo para administradores.</p>
      </div>

      <!-- Panel de gestión (solo visible para admins) -->
      <div *ngIf="authService.isAdmin()">
        <!-- Barra de acciones -->
        <div class="mb-6 flex justify-between items-center">
          <button
            (click)="toggleFormulario()"
            class="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded shadow">
            <i class="fas fa-plus mr-2"></i>
            {{ mostrarFormulario ? 'Cancelar' : 'Agregar Usuario' }}
          </button>

          <button
            (click)="cargarUsuarios()"
            [disabled]="cargando"
            class="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded shadow disabled:opacity-50">
            <i class="fas fa-sync-alt mr-2" [class.fa-spin]="cargando"></i>
            {{ cargando ? 'Cargando...' : 'Actualizar' }}
          </button>
        </div>

        <!-- Mensajes de éxito/error -->
        <div *ngIf="mensajeExito" class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          <p>{{ mensajeExito }}</p>
        </div>

        <div *ngIf="mensajeError" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p class="font-bold">Error:</p>
          <p>{{ mensajeError }}</p>
        </div>

        <!-- Formulario para nuevo/editar usuario -->
        <div *ngIf="mostrarFormulario" class="bg-gray-50 p-6 rounded-lg mb-6 shadow-lg">
          <h3 class="text-lg font-bold mb-4">{{ editandoUsuario ? 'Editar Usuario' : 'Nuevo Usuario' }}</h3>

          <form (ngSubmit)="guardarUsuario()" #usuarioForm="ngForm" class="space-y-4">
            <!-- Campos básicos -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Nombre de usuario <span class="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  [(ngModel)]="usuarioFormData.username"
                  name="username"
                  [disabled]="editandoUsuario"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-200">
                <small class="text-gray-500">Único, no se puede cambiar después</small>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Email <span class="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  [(ngModel)]="usuarioFormData.email"
                  name="email"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Nombre <span class="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  [(ngModel)]="usuarioFormData.firstName"
                  name="firstName"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Apellido <span class="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  [(ngModel)]="usuarioFormData.lastName"
                  name="lastName"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              </div>

              <div *ngIf="!editandoUsuario">
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña <span class="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  [(ngModel)]="usuarioFormData.password"
                  name="password"
                  [required]="!editandoUsuario"
                  minlength="8"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                <small class="text-gray-500">Mínimo 8 caracteres</small>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                <select
                  [(ngModel)]="usuarioFormData.role"
                  name="role"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Seleccionar rol</option>
                  <option value="Admin">Administrador</option>
                  <option value="Empleado">Empleado</option>
                  <option value="Supervisor">Supervisor</option>
                </select>
              </div>
            </div>

            <!-- Información adicional (colapsable) -->
            <div class="border-t pt-4">
              <button
                type="button"
                (click)="mostrarInfoAdicional = !mostrarInfoAdicional"
                class="text-blue-600 hover:text-blue-800 text-sm font-medium mb-2">
                {{ mostrarInfoAdicional ? '▼' : '▶' }} Información Adicional (Opcional)
              </button>

              <div *ngIf="mostrarInfoAdicional" class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Tipo de Documento</label>
                  <select
                    [(ngModel)]="usuarioFormData.idType"
                    name="idType"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md">
                    <option value="">Seleccionar</option>
                    <option value="CC">Cédula de Ciudadanía</option>
                    <option value="CE">Cédula de Extranjería</option>
                    <option value="PA">Pasaporte</option>
                  </select>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Número de Documento</label>
                  <input
                    type="text"
                    [(ngModel)]="usuarioFormData.idNumber"
                    name="idNumber"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md">
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Fecha de Nacimiento</label>
                  <input
                    type="date"
                    [(ngModel)]="usuarioFormData.birthDate"
                    name="birthDate"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md">
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Género</label>
                  <select
                    [(ngModel)]="usuarioFormData.gender"
                    name="gender"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md">
                    <option value="">Seleccionar</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Femenino">Femenino</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                  <input
                    type="tel"
                    [(ngModel)]="usuarioFormData.phone"
                    name="phone"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md">
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Teléfono Alternativo</label>
                  <input
                    type="tel"
                    [(ngModel)]="usuarioFormData.altPhone"
                    name="altPhone"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md">
                </div>

                <div class="md:col-span-2">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                  <input
                    type="text"
                    [(ngModel)]="usuarioFormData.address"
                    name="address"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md">
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Ciudad</label>
                  <input
                    type="text"
                    [(ngModel)]="usuarioFormData.city"
                    name="city"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md">
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Código Postal</label>
                  <input
                    type="text"
                    [(ngModel)]="usuarioFormData.postalCode"
                    name="postalCode"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md">
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">ID de Empleado</label>
                  <input
                    type="text"
                    [(ngModel)]="usuarioFormData.employeeId"
                    name="employeeId"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md">
                </div>
              </div>
            </div>

            <div class="flex items-center mt-4">
              <input
                type="checkbox"
                [(ngModel)]="usuarioFormData.enabled"
                name="enabled"
                id="enabled"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded">
              <label for="enabled" class="ml-2 block text-sm text-gray-900">
                Usuario activo
              </label>
            </div>

            <div class="flex space-x-3 pt-4 border-t">
              <button
                type="submit"
                [disabled]="!usuarioForm.form.valid || guardando"
                class="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-6 rounded shadow disabled:opacity-50">
                <i class="fas" [ngClass]="guardando ? 'fa-spinner fa-spin' : (editandoUsuario ? 'fa-save' : 'fa-plus')"></i>
                {{ guardando ? 'Guardando...' : (editandoUsuario ? 'Actualizar' : 'Crear') }} Usuario
              </button>
              <button
                type="button"
                (click)="cancelarEdicion()"
                [disabled]="guardando"
                class="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-6 rounded shadow disabled:opacity-50">
                Cancelar
              </button>
            </div>
          </form>
        </div>

        <!-- Lista de usuarios -->
        <div class="bg-white shadow-lg rounded-lg overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div class="flex justify-between items-center">
              <h3 class="text-lg font-semibold">
                Lista de Usuarios
                <span class="text-sm font-normal text-gray-600">({{ usuarios.length }} usuarios)</span>
              </h3>
            </div>
          </div>

          <div *ngIf="cargando" class="p-8 text-center">
            <i class="fas fa-spinner fa-spin text-4xl text-blue-500 mb-4"></i>
            <p class="text-gray-600">Cargando usuarios...</p>
          </div>

          <div *ngIf="!cargando && usuarios.length === 0" class="p-8 text-center">
            <i class="fas fa-users text-4xl text-gray-300 mb-4"></i>
            <p class="text-gray-600">No hay usuarios registrados</p>
            <button
              (click)="mostrarFormulario = true"
              class="mt-4 text-blue-600 hover:text-blue-800">
              Crear el primer usuario
            </button>
          </div>

          <div *ngIf="!cargando && usuarios.length > 0" class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre Completo</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Registro</th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr *ngFor="let usuario of usuarios" class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ usuario.id }}</td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">{{ usuario.username }}</div>
                    <div class="text-xs text-gray-500">{{ usuario.keycloakId.substring(0, 8) }}...</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ usuario.fullName || (usuario.firstName + ' ' + usuario.lastName) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{{ usuario.email }}</td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 py-1 text-xs font-semibold rounded-full"
                          [ngClass]="{
                            'bg-red-100 text-red-800': usuario.role === 'Admin',
                            'bg-blue-100 text-blue-800': usuario.role === 'Empleado',
                            'bg-green-100 text-green-800': usuario.role === 'Supervisor',
                            'bg-gray-100 text-gray-800': !usuario.role
                          }">
                      {{ usuario.role || 'Sin rol' }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 py-1 text-xs font-semibold rounded-full"
                          [ngClass]="usuario.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
                      {{ usuario.activo ? 'Activo' : 'Inactivo' }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {{ usuario.fechaRegistro | date:'dd/MM/yyyy HH:mm' }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div class="flex justify-end space-x-2">
                      <button
                        (click)="editarUsuario(usuario)"
                        title="Editar usuario"
                        class="text-blue-600 hover:text-blue-900">
                        <i class="fas fa-edit"></i>
                      </button>
                      <button
                        (click)="toggleActivoUsuario(usuario)"
                        [title]="usuario.activo ? 'Desactivar usuario' : 'Activar usuario'"
                        class="text-yellow-600 hover:text-yellow-900">
                        <i class="fas" [ngClass]="usuario.activo ? 'fa-toggle-on' : 'fa-toggle-off'"></i>
                      </button>
                      <button
                        (click)="mostrarModalPassword(usuario)"
                        title="Cambiar contraseña"
                        class="text-purple-600 hover:text-purple-900">
                        <i class="fas fa-key"></i>
                      </button>
                      <button
                        (click)="eliminarUsuario(usuario)"
                        title="Eliminar usuario"
                        class="text-red-600 hover:text-red-900">
                        <i class="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Modal para cambiar contraseña -->
      <div *ngIf="mostrarPasswordModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
          <h3 class="text-lg font-bold mb-4">Cambiar Contraseña</h3>
          <p class="text-sm text-gray-600 mb-4">Usuario: <strong>{{ usuarioPasswordModal?.username }}</strong></p>

          <form (ngSubmit)="cambiarPassword()" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Nueva Contraseña</label>
              <input
                type="password"
                [(ngModel)]="nuevaPassword"
                name="nuevaPassword"
                required
                minlength="8"
                class="w-full px-3 py-2 border border-gray-300 rounded-md">
              <small class="text-gray-500">Mínimo 8 caracteres</small>
            </div>

            <div class="flex items-center">
              <input
                type="checkbox"
                [(ngModel)]="passwordTemporal"
                name="passwordTemporal"
                id="passwordTemporal"
                class="h-4 w-4 text-blue-600 border-gray-300 rounded">
              <label for="passwordTemporal" class="ml-2 block text-sm text-gray-900">
                Contraseña temporal (el usuario debe cambiarla al iniciar sesión)
              </label>
            </div>

            <div class="flex space-x-3 pt-4">
              <button
                type="submit"
                [disabled]="!nuevaPassword || nuevaPassword.length < 8 || guardando"
                class="bg-purple-500 hover:bg-purple-600 text-white font-medium py-2 px-4 rounded disabled:opacity-50">
                Cambiar Contraseña
              </button>
              <button
                type="button"
                (click)="cerrarModalPassword()"
                [disabled]="guardando"
                class="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded disabled:opacity-50">
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Información adicional -->
      <div class="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 class="font-medium text-blue-800 mb-2">
          <i class="fas fa-info-circle mr-2"></i>Información sobre roles:
        </h4>
        <ul class="text-sm text-blue-700 space-y-1">
          <li><strong>Administrador:</strong> Acceso completo a todas las funcionalidades, incluyendo gestión de usuarios</li>
          <li><strong>Empleado:</strong> Acceso a trámites, documentos y funcionalidades operativas</li>
          <li><strong>Supervisor:</strong> Permisos de revisión y aprobación de trámites</li>
        </ul>
        <p class="text-xs text-blue-600 mt-2">
          <i class="fas fa-sync-alt mr-1"></i>
          Los cambios se sincronizan automáticamente con Keycloak y la base de datos local
        </p>
      </div>
    </div>
  `,
  styles: []
})
export class UsuariosComponent implements OnInit {
  usuarios: Usuario[] = [];
  mostrarFormulario = false;
  editandoUsuario = false;
  cargando = false;
  guardando = false;
  mensajeExito = '';
  mensajeError = '';
  mostrarInfoAdicional = false;

  // Modal de contraseña
  mostrarPasswordModal = false;
  usuarioPasswordModal: Usuario | null = null;
  nuevaPassword = '';
  passwordTemporal = false;

  usuarioFormData: any = this.getFormularioVacio();

  constructor(
    private usuarioService: UsuarioService,
    public authService: AuthService
  ) {}

  ngOnInit() {
    if (this.authService.isAdmin()) {
      this.cargarUsuarios();
    }
  }

  toggleFormulario() {
    this.mostrarFormulario = !this.mostrarFormulario;
    if (this.mostrarFormulario && this.editandoUsuario) {
      this.cancelarEdicion();
    }
  }

  cargarUsuarios() {
    this.cargando = true;
    this.limpiarMensajes();

    console.log('📋 Cargando lista de usuarios desde el backend...');

    this.usuarioService.getUsuariosLocales().subscribe({
      next: (usuarios) => {
        // Filtrar el usuario actual (el que inició sesión) de la lista
        const usuarioActual = this.authService.getUser();
        this.usuarios = usuarios.filter(u => u.username !== usuarioActual?.username);

        this.cargando = false;
        console.log('✅ Usuarios cargados correctamente:', usuarios.length);
        console.log('👥 Usuarios mostrados (sin el actual):', this.usuarios.length);
        console.log('📋 Lista de usuarios:', this.usuarios);

        if (usuarios.length === 0) {
          console.log('ℹ️ No hay usuarios en la base de datos local. Intentando sincronizar con Keycloak...');
          this.sincronizarConKeycloak();
        }
      },
      error: (error) => {
        console.error('❌ Error al cargar usuarios locales:', error);
        this.cargando = false;

        // Si falla cargar usuarios locales, intentar sincronizar con Keycloak
        if (error.status === 500 || error.status === 403) {
          console.log('🔄 Intentando sincronizar usuarios desde Keycloak...');
          this.sincronizarConKeycloak();
        } else {
          this.mensajeError = 'Error al cargar usuarios: ' + (error.error?.message || error.message);
        }
      }
    });
  }

  sincronizarConKeycloak() {
    console.log('🔄 Sincronizando usuarios con Keycloak...');
    this.cargando = true;

    this.usuarioService.sincronizarConKeycloak().subscribe({
      next: (usuarios) => {
        // Filtrar el usuario actual de la lista
        const usuarioActual = this.authService.getUser();
        this.usuarios = usuarios.filter(u => u.username !== usuarioActual?.username);

        this.cargando = false;
        console.log('✅ Usuarios sincronizados desde Keycloak:', usuarios.length);
        console.log('👥 Usuarios mostrados (sin el actual):', this.usuarios.length);
        this.mensajeExito = `Se sincronizaron ${this.usuarios.length} usuarios desde Keycloak`;
        this.autoOcultarMensaje();
      },
      error: (error) => {
        console.error('❌ Error al sincronizar con Keycloak:', error);
        this.cargando = false;

        if (error.status === 403) {
          this.mensajeError = 'No se tienen permisos para sincronizar usuarios con Keycloak. Contacte al administrador del sistema.';
        } else if (error.status === 500) {
          this.mensajeError = 'Error del servidor al sincronizar con Keycloak. Verifique la configuración del backend.';
        } else {
          this.mensajeError = 'Error al sincronizar con Keycloak: ' + (error.error?.message || error.message);
        }
      }
    });
  }

  guardarUsuario() {
    this.guardando = true;
    this.limpiarMensajes();

    if (this.editandoUsuario) {
      // Actualizar usuario existente
      const id = this.usuarioFormData.id;
      const datosActualizacion = { ...this.usuarioFormData };
      delete datosActualizacion.id;
      delete datosActualizacion.keycloakId;
      delete datosActualizacion.username; // username no se puede cambiar
      delete datosActualizacion.password;
      delete datosActualizacion.fechaRegistro;
      delete datosActualizacion.fullName;
      delete datosActualizacion.roles;

      this.usuarioService.actualizarUsuario(id, datosActualizacion).subscribe({
        next: (usuario) => {
          this.mensajeExito = `Usuario "${usuario.username}" actualizado exitosamente`;
          this.cargarUsuarios();
          this.cancelarEdicion();
          this.guardando = false;
          this.autoOcultarMensaje();
        },
        error: (error) => {
          console.error('❌ Error al actualizar usuario:', error);
          this.mensajeError = 'Error al actualizar usuario: ' + (error.error?.message || error.message);
          this.guardando = false;
        }
      });
    } else {
      // Crear nuevo usuario
      if (!this.usuarioFormData.password) {
        this.mensajeError = 'La contraseña es obligatoria para crear un usuario';
        this.guardando = false;
        return;
      }

      this.usuarioService.crearUsuario(this.usuarioFormData).subscribe({
        next: (usuario) => {
          this.mensajeExito = `Usuario "${usuario.username}" creado exitosamente`;
          this.cargarUsuarios();
          this.cancelarEdicion();
          this.guardando = false;
          this.autoOcultarMensaje();
        },
        error: (error) => {
          console.error('❌ Error al crear usuario:', error);
          this.mensajeError = 'Error al crear usuario: ' + (error.error?.message || error.message);
          this.guardando = false;
        }
      });
    }
  }

  editarUsuario(usuario: Usuario) {
    this.usuarioFormData = { ...usuario };
    this.editandoUsuario = true;
    this.mostrarFormulario = true;
    this.limpiarMensajes();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  toggleActivoUsuario(usuario: Usuario) {
    const accion = usuario.activo ? 'desactivar' : 'activar';
    if (!confirm(`¿Está seguro de ${accion} al usuario "${usuario.username}"?`)) {
      return;
    }

    this.limpiarMensajes();
    this.usuarioService.toggleActivoUsuario(usuario.id).subscribe({
      next: (usuarioActualizado) => {
        this.mensajeExito = `Usuario "${usuarioActualizado.username}" ${usuarioActualizado.activo ? 'activado' : 'desactivado'} exitosamente`;
        this.cargarUsuarios();
        this.autoOcultarMensaje();
      },
      error: (error) => {
        console.error('❌ Error al cambiar estado:', error);
        this.mensajeError = 'Error al cambiar estado: ' + (error.error?.message || error.message);
      }
    });
  }

  eliminarUsuario(usuario: Usuario) {
    if (!confirm(`¿Está COMPLETAMENTE SEGURO de eliminar al usuario "${usuario.username}"?\n\nEsta acción NO SE PUEDE DESHACER y eliminará el usuario de Keycloak y la base de datos.`)) {
      return;
    }

    this.limpiarMensajes();
    this.usuarioService.eliminarUsuario(usuario.id).subscribe({
      next: () => {
        this.mensajeExito = `Usuario "${usuario.username}" eliminado exitosamente`;
        this.cargarUsuarios();
        this.autoOcultarMensaje();
      },
      error: (error) => {
        console.error('❌ Error al eliminar usuario:', error);
        this.mensajeError = 'Error al eliminar usuario: ' + (error.error?.message || error.message);
      }
    });
  }

  mostrarModalPassword(usuario: Usuario) {
    this.usuarioPasswordModal = usuario;
    this.nuevaPassword = '';
    this.passwordTemporal = false;
    this.mostrarPasswordModal = true;
    this.limpiarMensajes();
  }

  cerrarModalPassword() {
    this.mostrarPasswordModal = false;
    this.usuarioPasswordModal = null;
    this.nuevaPassword = '';
    this.passwordTemporal = false;
  }

  cambiarPassword() {
    if (!this.usuarioPasswordModal || !this.nuevaPassword) {
      return;
    }

    this.guardando = true;
    this.limpiarMensajes();

    this.usuarioService.cambiarPassword(
      this.usuarioPasswordModal.id,
      this.nuevaPassword,
      this.passwordTemporal
    ).subscribe({
      next: () => {
        this.mensajeExito = `Contraseña actualizada para "${this.usuarioPasswordModal!.username}"`;
        this.cerrarModalPassword();
        this.guardando = false;
        this.autoOcultarMensaje();
      },
      error: (error) => {
        console.error('❌ Error al cambiar contraseña:', error);
        this.mensajeError = 'Error al cambiar contraseña: ' + (error.error?.message || error.message);
        this.guardando = false;
      }
    });
  }

  cancelarEdicion() {
    this.usuarioFormData = this.getFormularioVacio();
    this.editandoUsuario = false;
    this.mostrarFormulario = false;
    this.mostrarInfoAdicional = false;
    this.limpiarMensajes();
  }

  private getFormularioVacio(): any {
    return {
      username: '',
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      idType: '',
      idNumber: '',
      birthDate: '',
      gender: '',
      phone: '',
      altPhone: '',
      address: '',
      city: '',
      postalCode: '',
      employeeId: '',
      role: '',
      enabled: true
    };
  }

  private limpiarMensajes() {
    this.mensajeExito = '';
    this.mensajeError = '';
  }

  private autoOcultarMensaje() {
    setTimeout(() => {
      this.limpiarMensajes();
    }, 5000);
  }
}
