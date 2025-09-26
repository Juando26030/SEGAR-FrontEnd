import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50">
      <div class="max-w-md w-full bg-white shadow-lg rounded-lg p-6 text-center">
        <div class="mb-4">
          <svg class="mx-auto h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h1 class="text-2xl font-bold text-gray-900 mb-2">Acceso Denegado</h1>
        <p class="text-gray-600 mb-6">
          No tienes permisos suficientes para acceder a esta página.
        </p>
        <div class="space-y-3">
          <button 
            routerLink="/dashboard"
            class="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded">
            Ir al Dashboard
          </button>
          <button 
            (click)="goBack()"
            class="w-full bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-2 px-4 rounded">
            Volver Atrás
          </button>
        </div>
      </div>
    </div>
  `
})
export class UnauthorizedComponent {
  goBack() {
    window.history.back();
  }
}