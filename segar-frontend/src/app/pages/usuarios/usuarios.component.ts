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
    <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
      <div class="max-w-full mx-auto px-4">

        <!-- Header mejorado -->
        <div class="mb-8">
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center gap-4">
              <div class="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <i class="fas fa-users text-white text-3xl"></i>
              </div>
              <div>
                <h1 class="text-4xl font-bold text-gray-900">Gestión de Usuarios</h1>
                <p class="text-gray-600 text-lg mt-1">Panel de administración - Solo para administradores</p>
              </div>
            </div>

            <div class="flex gap-3">
              <button
                (click)="toggleFormulario()"
                class="inline-flex items-center gap-2 px-6 py-3 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
                [class.bg-gradient-to-r]="!mostrarFormulario"
                [class.from-blue-500]="!mostrarFormulario"
                [class.to-blue-600]="!mostrarFormulario"
                [class.hover:from-blue-600]="!mostrarFormulario"
                [class.hover:to-blue-700]="!mostrarFormulario"
                [class.bg-gray-500]="mostrarFormulario"
                [class.hover:bg-gray-600]="mostrarFormulario">
                <i class="fas" [class.fa-plus]="!mostrarFormulario" [class.fa-times]="mostrarFormulario"></i>
                <span>{{ mostrarFormulario ? 'Cancelar' : 'Nuevo Usuario' }}</span>
              </button>

              <button
                (click)="cargarUsuarios()"
                [disabled]="cargando"
                class="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed">
                <i class="fas fa-sync-alt" [class.fa-spin]="cargando"></i>
                <span>{{ cargando ? 'Cargando...' : 'Actualizar' }}</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Verificación de permisos -->
        <div *ngIf="!authService.isAdmin()" class="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-lg shadow-md mb-6">
          <div class="flex items-start">
            <i class="fas fa-exclamation-triangle text-red-500 text-2xl mr-4 mt-1"></i>
            <div>
              <h3 class="text-lg font-bold text-red-800 mb-2">Acceso Denegado</h3>
              <p class="text-red-700">Esta funcionalidad está disponible solo para administradores.</p>
            </div>
          </div>
        </div>

        <!-- Panel de gestión (solo visible para admins) -->
        <div *ngIf="authService.isAdmin()">

          <!-- Mensajes de éxito/error -->
          <div *ngIf="mensajeExito" class="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg shadow-md mb-6 animate-fade-in">
            <div class="flex items-center">
              <i class="fas fa-check-circle text-green-500 text-xl mr-3"></i>
              <p class="text-green-700 font-medium">{{ mensajeExito }}</p>
            </div>
          </div>

          <div *ngIf="mensajeError" class="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg shadow-md mb-6 animate-fade-in">
            <div class="flex items-start">
              <i class="fas fa-exclamation-circle text-red-500 text-xl mr-3 mt-0.5"></i>
              <div>
                <p class="text-red-800 font-bold mb-1">Error:</p>
                <p class="text-red-700">{{ mensajeError }}</p>
              </div>
            </div>
          </div>

          <!-- Formulario para nuevo/editar usuario -->
          <div *ngIf="mostrarFormulario" class="mb-8 animate-slide-down">
            <div class="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">

              <!-- Barra superior decorativa -->
              <div class="h-2 bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600"></div>

              <div class="p-8">
                <div class="flex items-center gap-3 mb-6">
                  <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <i class="fas fa-user-plus text-blue-600 text-xl"></i>
                  </div>
                  <h3 class="text-2xl font-bold text-gray-800">{{ editandoUsuario ? 'Editar Usuario' : 'Nuevo Usuario' }}</h3>
                </div>

                <form (ngSubmit)="guardarUsuario()" #usuarioForm="ngForm" class="space-y-6">

                  <!-- Información Básica -->
                  <div>
                    <div class="flex items-center gap-3 mb-4">
                      <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <i class="fas fa-user text-blue-600"></i>
                      </div>
                      <h4 class="text-lg font-bold text-gray-800">Información Básica</h4>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">
                          <i class="fas fa-at text-blue-500 mr-2"></i>
                          Nombre de usuario <span class="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          [(ngModel)]="usuarioFormData.username"
                          name="username"
                          [disabled]="editandoUsuario"
                          placeholder="usuario123"
                          required
                          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-300 bg-gray-50 focus:bg-white disabled:bg-gray-200">
                        <p class="mt-2 text-xs text-gray-500 flex items-center gap-1">
                          <i class="fas fa-info-circle"></i>
                          Único, no se puede cambiar después
                        </p>
                      </div>

                      <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">
                          <i class="fas fa-envelope text-green-500 mr-2"></i>
                          Email <span class="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          [(ngModel)]="usuarioFormData.email"
                          name="email"
                          placeholder="ejemplo@correo.com"
                          required
                          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-300 bg-gray-50 focus:bg-white">
                      </div>

                      <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">
                          <i class="fas fa-user-circle text-purple-500 mr-2"></i>
                          Nombre <span class="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          [(ngModel)]="usuarioFormData.firstName"
                          name="firstName"
                          placeholder="Ingrese el nombre"
                          required
                          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-300 bg-gray-50 focus:bg-white">
                      </div>

                      <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">
                          <i class="fas fa-user-circle text-purple-500 mr-2"></i>
                          Apellido <span class="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          [(ngModel)]="usuarioFormData.lastName"
                          name="lastName"
                          placeholder="Ingrese el apellido"
                          required
                          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-300 bg-gray-50 focus:bg-white">
                      </div>

                      <div *ngIf="!editandoUsuario">
                        <label class="block text-sm font-semibold text-gray-700 mb-2">
                          <i class="fas fa-lock text-red-500 mr-2"></i>
                          Contraseña <span class="text-red-500">*</span>
                        </label>
                        <div class="relative">
                          <input
                            [type]="mostrarPasswordCreacion ? 'text' : 'password'"
                            [(ngModel)]="usuarioFormData.password"
                            name="password"
                            placeholder="••••••••"
                            [required]="!editandoUsuario"
                            minlength="8"
                            class="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-300 bg-gray-50 focus:bg-white">
                          <button
                            type="button"
                            (click)="mostrarPasswordCreacion = !mostrarPasswordCreacion"
                            class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-600 focus:outline-none transition-colors duration-200"
                            title="{{ mostrarPasswordCreacion ? 'Ocultar contraseña' : 'Mostrar contraseña' }}">
                            <i class="fas text-lg" [class.fa-eye]="!mostrarPasswordCreacion" [class.fa-eye-slash]="mostrarPasswordCreacion"></i>
                          </button>
                        </div>
                        <p class="mt-2 text-xs text-gray-500 flex items-center gap-1">
                          <i class="fas fa-shield-alt"></i>
                          Mínimo 8 caracteres, debe incluir mayúsculas, minúsculas y números
                        </p>
                      </div>

                      <div *ngIf="!editandoUsuario">
                        <label class="block text-sm font-semibold text-gray-700 mb-2">
                          <i class="fas fa-lock text-red-500 mr-2"></i>
                          Confirmar Contraseña <span class="text-red-500">*</span>
                        </label>
                        <div class="relative">
                          <input
                            [type]="mostrarPasswordConfirmacion ? 'text' : 'password'"
                            [(ngModel)]="confirmarPassword"
                            name="confirmarPassword"
                            placeholder="••••••••"
                            [required]="!editandoUsuario"
                            class="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-300 bg-gray-50 focus:bg-white">
                          <button
                            type="button"
                            (click)="mostrarPasswordConfirmacion = !mostrarPasswordConfirmacion"
                            class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-600 focus:outline-none transition-colors duration-200"
                            title="{{ mostrarPasswordConfirmacion ? 'Ocultar contraseña' : 'Mostrar contraseña' }}">
                            <i class="fas text-lg" [class.fa-eye]="!mostrarPasswordConfirmacion" [class.fa-eye-slash]="mostrarPasswordConfirmacion"></i>
                          </button>
                        </div>
                        <p *ngIf="confirmarPassword && usuarioFormData.password !== confirmarPassword" class="mt-2 text-xs text-red-600 flex items-center gap-1">
                          <i class="fas fa-exclamation-circle"></i>
                          Las contraseñas no coinciden
                        </p>
                        <p *ngIf="confirmarPassword && usuarioFormData.password === confirmarPassword" class="mt-2 text-xs text-green-600 flex items-center gap-1">
                          <i class="fas fa-check-circle"></i>
                          Las contraseñas coinciden
                        </p>
                      </div>

                      <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">
                          <i class="fas fa-user-tag text-indigo-500 mr-2"></i>
                          Rol
                        </label>
                        <select
                          [(ngModel)]="usuarioFormData.role"
                          name="role"
                          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-300 bg-gray-50 focus:bg-white">
                          <option value="">Seleccionar rol</option>
                          <option value="Admin">Administrador</option>
                          <option value="Empleado">Empleado</option>
                          <option value="Supervisor">Supervisor</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <!-- Información adicional (colapsable) -->
                  <div class="border-t pt-6">
                    <button
                      type="button"
                      (click)="mostrarInfoAdicional = !mostrarInfoAdicional"
                      class="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold mb-4 transition-colors duration-200">
                      <i class="fas" [class.fa-chevron-down]="mostrarInfoAdicional" [class.fa-chevron-right]="!mostrarInfoAdicional"></i>
                      <span>Información Adicional (Opcional)</span>
                    </button>

                    <div *ngIf="mostrarInfoAdicional" class="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                      <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">
                          <i class="fas fa-id-card text-purple-500 mr-2"></i>
                          Tipo de Documento
                        </label>
                        <select
                          [(ngModel)]="usuarioFormData.idType"
                          name="idType"
                          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-300 bg-gray-50 focus:bg-white">
                          <option value="">Seleccionar</option>
                          <option value="CC">Cédula de Ciudadanía</option>
                          <option value="CE">Cédula de Extranjería</option>
                          <option value="PA">Pasaporte</option>
                        </select>
                      </div>

                      <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">
                          <i class="fas fa-hashtag text-purple-500 mr-2"></i>
                          Número de Documento
                        </label>
                        <input
                          type="text"
                          [(ngModel)]="usuarioFormData.idNumber"
                          name="idNumber"
                          placeholder="Ej: 1234567890"
                          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-300 bg-gray-50 focus:bg-white">
                      </div>

                      <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">
                          <i class="fas fa-calendar text-green-500 mr-2"></i>
                          Fecha de Nacimiento
                        </label>
                        <input
                          type="date"
                          [(ngModel)]="usuarioFormData.birthDate"
                          name="birthDate"
                          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-300 bg-gray-50 focus:bg-white">
                      </div>

                      <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">
                          <i class="fas fa-venus-mars text-pink-500 mr-2"></i>
                          Género
                        </label>
                        <select
                          [(ngModel)]="usuarioFormData.gender"
                          name="gender"
                          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-300 bg-gray-50 focus:bg-white">
                          <option value="">Seleccionar</option>
                          <option value="Masculino">Masculino</option>
                          <option value="Femenino">Femenino</option>
                          <option value="Otro">Otro</option>
                        </select>
                      </div>

                      <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">
                          <i class="fas fa-mobile-alt text-orange-500 mr-2"></i>
                          Teléfono
                        </label>
                        <input
                          type="tel"
                          [(ngModel)]="usuarioFormData.phone"
                          name="phone"
                          placeholder="Ej: 3001234567"
                          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-300 bg-gray-50 focus:bg-white">
                      </div>

                      <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">
                          <i class="fas fa-phone text-orange-500 mr-2"></i>
                          Teléfono Alternativo
                        </label>
                        <input
                          type="tel"
                          [(ngModel)]="usuarioFormData.altPhone"
                          name="altPhone"
                          placeholder="Opcional"
                          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-300 bg-gray-50 focus:bg-white">
                      </div>

                      <div class="md:col-span-2">
                        <label class="block text-sm font-semibold text-gray-700 mb-2">
                          <i class="fas fa-map-marker-alt text-red-500 mr-2"></i>
                          Dirección
                        </label>
                        <input
                          type="text"
                          [(ngModel)]="usuarioFormData.address"
                          name="address"
                          placeholder="Ej: Calle 123 # 45-67"
                          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-300 bg-gray-50 focus:bg-white">
                      </div>

                      <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">
                          <i class="fas fa-city text-teal-500 mr-2"></i>
                          Ciudad
                        </label>
                        <input
                          type="text"
                          [(ngModel)]="usuarioFormData.city"
                          name="city"
                          placeholder="Ej: Bogotá"
                          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-300 bg-gray-50 focus:bg-white">
                      </div>

                      <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">
                          <i class="fas fa-mailbox text-teal-500 mr-2"></i>
                          Código Postal
                        </label>
                        <input
                          type="text"
                          [(ngModel)]="usuarioFormData.postalCode"
                          name="postalCode"
                          placeholder="Opcional"
                          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-300 bg-gray-50 focus:bg-white">
                      </div>

                      <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">
                          <i class="fas fa-id-badge text-indigo-500 mr-2"></i>
                          ID de Empleado
                        </label>
                        <input
                          type="text"
                          [(ngModel)]="usuarioFormData.employeeId"
                          name="employeeId"
                          placeholder="Opcional"
                          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-300 bg-gray-50 focus:bg-white">
                      </div>
                    </div>
                  </div>

                  <!-- Botones de acción -->
                  <div class="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      (click)="cancelarEdicion()"
                      [disabled]="guardando"
                      class="flex-1 sm:flex-none px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed">
                      <i class="fas fa-times group-hover:rotate-90 transition-transform duration-300"></i>
                      <span>Cancelar</span>
                    </button>

                    <button
                      type="submit"
                      [disabled]="!usuarioForm.form.valid || guardando"
                      class="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
                      <i class="fas" [class.fa-spinner]="guardando" [class.fa-spin]="guardando" [class.fa-save]="!guardando && editandoUsuario" [class.fa-plus]="!guardando && !editandoUsuario" [class.group-hover:scale-110]="!guardando" [class.transition-transform]="!guardando" [class.duration-200]="!guardando"></i>
                      <span>{{ guardando ? 'Guardando...' : (editandoUsuario ? 'Actualizar Usuario' : 'Crear Usuario') }}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          <!-- Lista de usuarios -->
          <div class="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
            <div class="px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <i class="fas fa-list text-blue-600"></i>
                  </div>
                  <div>
                    <h3 class="text-xl font-bold text-gray-800">Lista de Usuarios</h3>
                    <p class="text-sm text-gray-600">{{ usuarios.length }} usuarios registrados</p>
                  </div>
                </div>
              </div>
            </div>

            <div *ngIf="cargando" class="p-12 text-center">
              <div class="relative inline-block">
                <div class="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                <i class="fas fa-users text-blue-600 text-2xl absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></i>
              </div>
              <p class="text-gray-600 mt-4 font-medium">Cargando usuarios...</p>
            </div>

            <div *ngIf="!cargando && usuarios.length === 0" class="p-12 text-center">
              <div class="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i class="fas fa-users text-gray-400 text-4xl"></i>
              </div>
              <h3 class="text-xl font-semibold text-gray-700 mb-2">No hay usuarios registrados</h3>
              <p class="text-gray-500 mb-6">Comienza agregando tu primer usuario</p>
              <button
                (click)="mostrarFormulario = true"
                class="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200">
                <i class="fas fa-plus-circle"></i>
                Crear Primer Usuario
              </button>
            </div>

            <div *ngIf="!cargando && usuarios.length > 0" class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider w-1/5">
                      <i class="fas fa-user mr-2"></i>Usuario
                    </th>
                    <th class="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider w-1/4">
                      <i class="fas fa-envelope mr-2"></i>Email
                    </th>
                    <th class="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider w-1/6">
                      <i class="fas fa-user-tag mr-2"></i>Rol
                    </th>
                    <th class="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider w-1/6">
                      <i class="fas fa-toggle-on mr-2"></i>Estado
                    </th>
                    <th class="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider w-1/4">
                      <i class="fas fa-cogs mr-2"></i>Acciones
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr *ngFor="let usuario of usuarios" class="hover:bg-blue-50 transition-colors duration-150">
                    <td class="px-6 py-5 whitespace-nowrap">
                      <div class="flex items-center">
                        <div class="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                          <span class="text-white font-bold text-sm">{{ usuario.username.substring(0, 2).toUpperCase() }}</span>
                        </div>
                        <div class="min-w-0">
                          <div class="text-sm font-semibold text-gray-900">{{ usuario.username }}</div>
                          <div class="text-xs text-gray-500">{{ usuario.firstName }} {{ usuario.lastName }}</div>
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-5">
                      <div class="text-sm text-gray-600 flex items-center">
                        <i class="fas fa-envelope text-gray-400 mr-2 flex-shrink-0"></i>
                        <span>{{ usuario.email }}</span>
                      </div>
                    </td>
                    <td class="px-6 py-5 whitespace-nowrap">
                      <span class="px-3 py-1.5 text-xs font-semibold rounded-full shadow-sm inline-flex items-center gap-1"
                            [ngClass]="{
                              'bg-red-100 text-red-800': usuario.role === 'Admin',
                              'bg-blue-100 text-blue-800': usuario.role === 'Empleado',
                              'bg-green-100 text-green-800': usuario.role === 'Supervisor',
                              'bg-gray-100 text-gray-800': !usuario.role
                            }">
                        <i class="fas fa-circle text-xs"></i>
                        {{ usuario.role || 'Sin rol' }}
                      </span>
                    </td>
                    <td class="px-6 py-5 whitespace-nowrap text-center">
                      <button
                        (click)="toggleActivoUsuario(usuario)"
                        class="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md transform hover:scale-105"
                        [ngClass]="usuario.activo ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-red-100 text-red-800 hover:bg-red-200'"
                        title="{{ usuario.activo ? 'Clic para desactivar' : 'Clic para activar' }}">
                        <i class="fas text-sm" [class.fa-toggle-on]="usuario.activo" [class.fa-toggle-off]="!usuario.activo"></i>
                        <span>{{ usuario.activo ? 'Activo' : 'Inactivo' }}</span>
                      </button>
                    </td>
                    <td class="px-6 py-5 whitespace-nowrap text-center">
                      <div class="flex items-center justify-center gap-2">
                        <button
                          (click)="mostrarModalPassword(usuario)"
                          class="inline-flex items-center gap-1.5 px-3 py-2 bg-purple-100 text-purple-700 hover:bg-purple-200 rounded-lg transition-all duration-200 transform hover:scale-105 hover:shadow-md"
                          title="Cambiar contraseña">
                          <i class="fas fa-key text-sm"></i>
                          <span class="text-xs font-semibold">Contraseña</span>
                        </button>
                        <button
                          (click)="editarUsuario(usuario)"
                          class="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg transition-all duration-200 transform hover:scale-105 hover:shadow-md"
                          title="Editar usuario">
                          <i class="fas fa-edit text-sm"></i>
                          <span class="text-xs font-semibold">Editar</span>
                        </button>
                        <button
                          (click)="confirmarEliminar(usuario)"
                          class="inline-flex items-center gap-1.5 px-3 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg transition-all duration-200 transform hover:scale-105 hover:shadow-md"
                          title="Eliminar usuario">
                          <i class="fas fa-trash text-sm"></i>
                          <span class="text-xs font-semibold">Eliminar</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal de cambio de contraseña -->
      <div *ngIf="mostrarPasswordModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" (click)="cerrarModalPassword()">
        <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden" (click)="$event.stopPropagation()">
          <!-- Barra decorativa -->
          <div class="h-2 bg-gradient-to-r from-purple-400 via-purple-500 to-purple-600"></div>

          <div class="p-6">
            <div class="flex items-center gap-3 mb-6">
              <div class="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <i class="fas fa-key text-purple-600 text-xl"></i>
              </div>
              <div>
                <h3 class="text-xl font-bold text-gray-800">Cambiar Contraseña</h3>
                <p class="text-sm text-gray-600">{{ usuarioPasswordModal?.username }}</p>
              </div>
            </div>

            <div class="space-y-4">
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">
                  <i class="fas fa-lock text-purple-500 mr-2"></i>
                  Nueva Contraseña
                </label>
                <div class="relative">
                  <input
                    [type]="mostrarPassword ? 'text' : 'password'"
                    [(ngModel)]="nuevaPassword"
                    placeholder="Ingrese nueva contraseña"
                    (input)="validarPassword(nuevaPassword)"
                    class="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-purple-300 bg-gray-50 focus:bg-white">
                  <button
                    type="button"
                    (click)="mostrarPassword = !mostrarPassword"
                    class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-purple-600 focus:outline-none transition-colors duration-200"
                    title="{{ mostrarPassword ? 'Ocultar contraseña' : 'Mostrar contraseña' }}">
                    <i class="fas text-lg" [class.fa-eye]="!mostrarPassword" [class.fa-eye-slash]="mostrarPassword"></i>
                  </button>
                </div>
                <div class="mt-2 space-y-1">
                  <p class="text-xs text-gray-600">
                    <i class="fas fa-info-circle mr-1"></i>
                    La contraseña debe cumplir con:
                  </p>
                  <ul class="text-xs space-y-1 ml-5">
                    <li [class.text-green-600]="nuevaPassword.length >= 8" [class.text-gray-500]="nuevaPassword.length < 8">
                      <i class="fas mr-1" [class.fa-check-circle]="nuevaPassword.length >= 8" [class.fa-circle]="nuevaPassword.length < 8"></i>
                      Mínimo 8 caracteres
                    </li>
                    <li [class.text-green-600]="tieneMinuscula(nuevaPassword)" [class.text-gray-500]="!tieneMinuscula(nuevaPassword)">
                      <i class="fas mr-1" [class.fa-check-circle]="tieneMinuscula(nuevaPassword)" [class.fa-circle]="!tieneMinuscula(nuevaPassword)"></i>
                      Al menos una letra minúscula
                    </li>
                    <li [class.text-green-600]="tieneMayuscula(nuevaPassword)" [class.text-gray-500]="!tieneMayuscula(nuevaPassword)">
                      <i class="fas mr-1" [class.fa-check-circle]="tieneMayuscula(nuevaPassword)" [class.fa-circle]="!tieneMayuscula(nuevaPassword)"></i>
                      Al menos una letra mayúscula
                    </li>
                    <li [class.text-green-600]="tieneNumero(nuevaPassword)" [class.text-gray-500]="!tieneNumero(nuevaPassword)">
                      <i class="fas mr-1" [class.fa-check-circle]="tieneNumero(nuevaPassword)" [class.fa-circle]="!tieneNumero(nuevaPassword)"></i>
                      Al menos un número
                    </li>
                  </ul>
                </div>
                <p *ngIf="errorPassword" class="mt-2 text-xs text-red-600 flex items-center gap-1">
                  <i class="fas fa-exclamation-triangle"></i>
                  {{ errorPassword }}
                </p>
              </div>
            </div>

            <div class="flex gap-3 mt-6">
              <button
                (click)="cerrarModalPassword()"
                class="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all duration-200">
                Cancelar
              </button>
              <button
                (click)="cambiarPassword()"
                [disabled]="!nuevaPassword || guardando || !esPasswordValida(nuevaPassword)"
                class="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
                {{ guardando ? 'Guardando...' : 'Cambiar' }}
              </button>
            </div>
          </div>
        </div>
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
  mostrarPassword = false;

  // Controles de visibilidad de contraseña en formulario de creación
  mostrarPasswordCreacion = false;
  mostrarPasswordConfirmacion = false;
  confirmarPassword = '';

  // Mensajes de error de validación de contraseña
  errorPassword = '';

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

    this.usuarioService.getUsuariosLocales(this.authService.getToken()).subscribe({
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

    this.usuarioService.sincronizarConKeycloak(this.authService.getToken()).subscribe({
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

      this.usuarioService.actualizarUsuario(id, datosActualizacion, this.authService.getToken()).subscribe({
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
      // Crear nuevo usuario - Validar contraseña
      if (!this.usuarioFormData.password) {
        this.mensajeError = 'La contraseña es obligatoria para crear un usuario';
        this.guardando = false;
        return;
      }

      // Validar que la contraseña cumpla con los requisitos
      if (!this.esPasswordValida(this.usuarioFormData.password)) {
        this.mensajeError = 'La contraseña no cumple con los requisitos de seguridad: debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas y números';
        this.guardando = false;
        return;
      }

      // Validar que las contraseñas coincidan
      if (this.usuarioFormData.password !== this.confirmarPassword) {
        this.mensajeError = 'Las contraseñas no coinciden. Por favor, verifique que ambas contraseñas sean iguales';
        this.guardando = false;
        return;
      }

      this.usuarioService.crearUsuario(this.usuarioFormData, this.authService.getToken()).subscribe({
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

  confirmarEliminar(usuario: Usuario) {
    if (confirm(`¿Está seguro de eliminar al usuario "${usuario.username}"?\n\nEsta acción no se puede deshacer.`)) {
      this.eliminarUsuario(usuario);
    }
  }

  toggleActivoUsuario(usuario: Usuario) {
    const accion = usuario.activo ? 'desactivar' : 'activar';
    if (!confirm(`¿Está seguro de ${accion} al usuario "${usuario.username}"?`)) {
      return;
    }

    this.limpiarMensajes();
    this.usuarioService.toggleActivoUsuario(usuario.id, this.authService.getToken()).subscribe({
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
    this.usuarioService.eliminarUsuario(usuario.id, this.authService.getToken()).subscribe({
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
    this.mostrarPasswordModal = true;
    this.limpiarMensajes();
  }

  cerrarModalPassword() {
    this.mostrarPasswordModal = false;
    this.usuarioPasswordModal = null;
    this.nuevaPassword = '';
  }

  cambiarPassword() {
    if (!this.usuarioPasswordModal || !this.nuevaPassword) {
      console.warn('⚠️ No se puede cambiar contraseña: datos faltantes');
      return;
    }

    console.log('🔑 ========== CAMBIAR CONTRASEÑA ==========');
    console.log('🔑 Usuario ID:', this.usuarioPasswordModal.id);
    console.log('🔑 Username:', this.usuarioPasswordModal.username);
    console.log('🔑 Email:', this.usuarioPasswordModal.email);
    console.log('🔑 Rol:', this.usuarioPasswordModal.role);
    console.log('🔑 =========================================');

    this.guardando = true;
    this.limpiarMensajes();

    this.usuarioService.cambiarPassword(
      this.usuarioPasswordModal.id,
      this.nuevaPassword,
      false,
      this.authService.getToken()
    ).subscribe({
      next: () => {
        console.log('✅ Contraseña actualizada exitosamente');
        this.mensajeExito = `Contraseña actualizada para "${this.usuarioPasswordModal!.username}"`;
        this.cerrarModalPassword();
        this.guardando = false;
        this.autoOcultarMensaje();
      },
      error: (error) => {
        console.error('❌ ========== ERROR AL CAMBIAR CONTRASEÑA ==========');
        console.error('❌ Status:', error.status);
        console.error('❌ Status Text:', error.statusText);
        console.error('❌ Error completo:', error);
        console.error('❌ Error.error:', error.error);
        console.error('❌ Mensaje:', error.error?.message || error.message);
        console.error('❌ ==================================================');
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

  validarPassword(password: string) {
    this.errorPassword = '';

    if (password.length < 8) {
      this.errorPassword = 'La contraseña debe tener al menos 8 caracteres';
      return;
    }

    if (!/[a-z]/.test(password)) {
      this.errorPassword = 'La contraseña debe contener al menos una letra minúscula';
      return;
    }

    if (!/[A-Z]/.test(password)) {
      this.errorPassword = 'La contraseña debe contener al menos una letra mayúscula';
      return;
    }

    if (!/[0-9]/.test(password)) {
      this.errorPassword = 'La contraseña debe contener al menos un número';
      return;
    }

    this.errorPassword = '';
  }

  esPasswordValida(password: string): boolean {
    return password.length >= 8 && /[a-z]/.test(password) && /[A-Z]/.test(password) && /[0-9]/.test(password);
  }

  tieneMinuscula(password: string): boolean {
    return /[a-z]/.test(password);
  }

  tieneMayuscula(password: string): boolean {
    return /[A-Z]/.test(password);
  }

  tieneNumero(password: string): boolean {
    return /[0-9]/.test(password);
  }
}
