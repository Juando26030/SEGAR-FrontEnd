import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuarioService, Usuario } from '../../core/services/usuario.service';
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
        <!-- Botón para agregar usuario -->
        <div class="mb-6">
          <button 
            (click)="mostrarFormulario = !mostrarFormulario"
            class="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded">
            <i class="fas fa-plus mr-2"></i>
            {{ mostrarFormulario ? 'Cancelar' : 'Agregar Usuario' }}
          </button>
        </div>

        <!-- Formulario para nuevo usuario -->
        <div *ngIf="mostrarFormulario" class="bg-gray-50 p-6 rounded-lg mb-6">
          <h3 class="text-lg font-medium mb-4">{{ editandoUsuario ? 'Editar' : 'Nuevo' }} Usuario</h3>
          
          <form (ngSubmit)="guardarUsuario()" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Nombre de usuario</label>
                <input 
                  type="text" 
                  [(ngModel)]="usuarioForm.username"
                  name="username"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input 
                  type="email" 
                  [(ngModel)]="usuarioForm.email"
                  name="email"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input 
                  type="text" 
                  [(ngModel)]="usuarioForm.firstName"
                  name="firstName"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
                <input 
                  type="text" 
                  [(ngModel)]="usuarioForm.lastName"
                  name="lastName"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              </div>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Rol</label>
              <select 
                [(ngModel)]="rolSeleccionado"
                name="rol"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Seleccionar rol</option>
                <option value="admin">Administrador</option>
                <option value="empleado">Empleado</option>
              </select>
            </div>
            
            <div class="flex items-center">
              <input 
                type="checkbox" 
                [(ngModel)]="usuarioForm.enabled"
                name="enabled"
                id="enabled"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded">
              <label for="enabled" class="ml-2 block text-sm text-gray-900">
                Usuario activo
              </label>
            </div>
            
            <div class="flex space-x-3">
              <button 
                type="submit"
                class="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded">
                {{ editandoUsuario ? 'Actualizar' : 'Crear' }} Usuario
              </button>
              <button 
                type="button"
                (click)="cancelarEdicion()"
                class="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded">
                Cancelar
              </button>
            </div>
          </form>
        </div>

        <!-- Lista de usuarios -->
        <div class="bg-white shadow-lg rounded-lg overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-medium">Lista de Usuarios</h3>
          </div>
          
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr>
                  <td colspan="5" class="px-6 py-4 text-center text-gray-500">
                    Funcionalidad en desarrollo - Se integrará con Keycloak
                  </td>
                </tr>
                <!-- Aquí se mostrarán los usuarios reales cuando se integre con Keycloak -->
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Información adicional -->
      <div class="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 class="font-medium text-blue-800 mb-2">Información sobre roles:</h4>
        <ul class="text-sm text-blue-700 space-y-1">
          <li><strong>Administrador:</strong> Acceso completo a todas las funcionalidades, incluyendo gestión de usuarios</li>
          <li><strong>Empleado:</strong> Acceso a trámites, documentos y funcionalidades operativas (sin gestión de usuarios)</li>
        </ul>
      </div>
    </div>
  `,
  styles: []
})
export class UsuariosComponent implements OnInit {
  usuarios: Usuario[] = [];
  mostrarFormulario = false;
  editandoUsuario = false;
  rolSeleccionado = '';
  
  usuarioForm: Usuario = {
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    enabled: true,
    roles: []
  };

  constructor(
    private usuarioService: UsuarioService,
    public authService: AuthService
  ) {}

  ngOnInit() {
    if (this.authService.isAdmin()) {
      this.cargarUsuarios();
    }
  }

  cargarUsuarios() {
    // Por ahora no cargamos usuarios reales hasta tener Keycloak configurado
    console.log('Cargando usuarios...');
  }

  guardarUsuario() {
    // Asignar el rol seleccionado
    this.usuarioForm.roles = [this.rolSeleccionado];
    
    if (this.editandoUsuario) {
      // Lógica para actualizar usuario
      console.log('Actualizando usuario:', this.usuarioForm);
    } else {
      // Lógica para crear usuario
      console.log('Creando usuario:', this.usuarioForm);
    }
    
    this.resetFormulario();
  }

  editarUsuario(usuario: Usuario) {
    this.usuarioForm = { ...usuario };
    this.rolSeleccionado = usuario.roles[0] || '';
    this.editandoUsuario = true;
    this.mostrarFormulario = true;
  }

  eliminarUsuario(id: string) {
    if (confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
      console.log('Eliminando usuario:', id);
    }
  }

  cancelarEdicion() {
    this.resetFormulario();
  }

  private resetFormulario() {
    this.usuarioForm = {
      username: '',
      email: '',
      firstName: '',
      lastName: '',
      enabled: true,
      roles: []
    };
    this.rolSeleccionado = '';
    this.editandoUsuario = false;
    this.mostrarFormulario = false;
  }
}