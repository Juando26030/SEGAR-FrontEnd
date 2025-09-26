import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService, UserInfo } from '../../auth/services/auth.service';

@Component({
  selector: 'app-keycloak-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
      <div class="container mx-auto px-4">
        <div class="flex justify-between items-center py-4">
          <!-- Logo y título -->
          <div class="flex items-center space-x-4">
            <img src="/assets/logo-segar.png" alt="SEGAR" class="h-8 w-8">
            <h1 class="text-xl font-bold">SEGAR</h1>
          </div>

          <!-- Menú principal (solo si está autenticado) -->
          <div *ngIf="user" class="hidden md:flex space-x-6">
            <a routerLink="/dashboard" 
               routerLinkActive="border-b-2 border-white" 
               class="hover:text-blue-200 pb-1 transition-colors">
              Dashboard
            </a>
            <a routerLink="/tramites" 
               routerLinkActive="border-b-2 border-white" 
               class="hover:text-blue-200 pb-1 transition-colors">
              Trámites
            </a>
            <a routerLink="/documentos" 
               routerLinkActive="border-b-2 border-white" 
               class="hover:text-blue-200 pb-1 transition-colors">
              Documentos
            </a>
            
            <!-- Menú exclusivo para administradores -->
            <div *ngIf="isAdmin" class="relative group">
              <button class="hover:text-blue-200 pb-1 transition-colors flex items-center">
                Administración
                <svg class="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>
              <div class="absolute top-full left-0 mt-1 w-48 bg-white rounded-md shadow-lg py-1 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                <a routerLink="/usuarios" 
                   class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Gestión de Usuarios
                </a>
                <a routerLink="/configuracion" 
                   class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Configuración
                </a>
              </div>
            </div>
          </div>

          <!-- Información del usuario -->
          <div *ngIf="user" class="flex items-center space-x-4">
            <!-- Información del usuario -->
            <div class="hidden md:flex items-center space-x-3">
              <div class="text-right">
                <div class="text-sm font-medium">{{ user.firstName }} {{ user.lastName }}</div>
                <div class="text-xs text-blue-200">{{ user.email }}</div>
              </div>
              <div class="flex items-center space-x-2">
                <span class="text-xs px-2 py-1 rounded-full font-medium"
                      [ngClass]="getRoleBadgeClass()">
                  {{ getPrimaryRoleDisplay() }}
                </span>
              </div>
            </div>

            <!-- Menú de usuario -->
            <div class="relative group">
              <button class="flex items-center space-x-2 hover:bg-blue-700 rounded-md px-3 py-2 transition-colors">
                <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-sm font-bold">
                  {{ getUserInitials() }}
                </div>
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>
              
              <div class="absolute right-0 top-full mt-1 w-48 bg-white rounded-md shadow-lg py-1 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                <a routerLink="/perfil" 
                   class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Mi Perfil
                </a>
                <div class="border-t border-gray-100 my-1"></div>
                <button 
                  (click)="logout()" 
                  class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                  Cerrar Sesión
                </button>
              </div>
            </div>
          </div>

          <!-- Botón de login (solo si no está autenticado) -->
          <div *ngIf="!user">
            <button 
              (click)="login()" 
              class="bg-green-500 hover:bg-green-600 px-6 py-2 rounded-md font-medium transition-colors">
              Iniciar Sesión
            </button>
          </div>

          <!-- Menú móvil (hamburguesa) -->
          <div *ngIf="user" class="md:hidden">
            <button 
              (click)="toggleMobileMenu()"
              class="hover:bg-blue-700 p-2 rounded-md transition-colors">
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>
          </div>
        </div>

        <!-- Menú móvil expandido -->
        <div *ngIf="showMobileMenu && user" class="md:hidden pb-4 space-y-2">
          <a routerLink="/dashboard" 
             (click)="closeMobileMenu()"
             class="block py-2 px-4 hover:bg-blue-700 rounded transition-colors">
            Dashboard
          </a>
          <a routerLink="/tramites" 
             (click)="closeMobileMenu()"
             class="block py-2 px-4 hover:bg-blue-700 rounded transition-colors">
            Trámites
          </a>
          <a routerLink="/documentos" 
             (click)="closeMobileMenu()"
             class="block py-2 px-4 hover:bg-blue-700 rounded transition-colors">
            Documentos
          </a>
          
          <div *ngIf="isAdmin" class="space-y-2">
            <div class="border-t border-blue-500 my-2"></div>
            <a routerLink="/usuarios" 
               (click)="closeMobileMenu()"
               class="block py-2 px-4 hover:bg-blue-700 rounded transition-colors">
              Gestión de Usuarios
            </a>
            <a routerLink="/configuracion" 
               (click)="closeMobileMenu()"
               class="block py-2 px-4 hover:bg-blue-700 rounded transition-colors">
              Configuración
            </a>
          </div>
          
          <div class="border-t border-blue-500 my-2"></div>
          <a routerLink="/perfil" 
             (click)="closeMobileMenu()"
             class="block py-2 px-4 hover:bg-blue-700 rounded transition-colors">
            Mi Perfil
          </a>
          <button 
            (click)="logout()" 
            class="w-full text-left py-2 px-4 text-red-200 hover:bg-red-600 rounded transition-colors">
            Cerrar Sesión
          </button>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .group:hover .group-hover\\:opacity-100 {
      opacity: 1;
    }
    .group:hover .group-hover\\:visible {
      visibility: visible;
    }
  `]
})
export class KeycloakNavbarComponent implements OnInit {
  user: UserInfo | null = null;
  isAdmin = false;
  showMobileMenu = false;

  constructor(
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.authService.user$.subscribe(user => {
      this.user = user;
      this.isAdmin = this.authService.isAdmin();
    });
  }

  login() {
    this.authService.login();
  }

  logout() {
    this.authService.logout();
  }

  getUserInitials(): string {
    if (!this.user) return 'U';
    
    const first = this.user.firstName?.charAt(0) || '';
    const last = this.user.lastName?.charAt(0) || '';
    
    return (first + last).toUpperCase() || this.user.username?.charAt(0).toUpperCase() || 'U';
  }

  getPrimaryRoleDisplay(): string {
    if (!this.user?.roles?.length) return 'Usuario';
    
    if (this.user.roles.includes('admin')) return 'Administrador';
    if (this.user.roles.includes('empleado')) return 'Empleado';
    
    return this.user.roles[0];
  }

  getRoleBadgeClass(): string {
    const role = this.getPrimaryRoleDisplay().toLowerCase();
    
    if (role.includes('administrador')) {
      return 'bg-purple-100 text-purple-800';
    }
    if (role.includes('empleado')) {
      return 'bg-blue-100 text-blue-800';
    }
    
    return 'bg-gray-100 text-gray-800';
  }

  toggleMobileMenu() {
    this.showMobileMenu = !this.showMobileMenu;
  }

  closeMobileMenu() {
    this.showMobileMenu = false;
  }
}