import { Injectable } from '@angular/core';
import { Location } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

/**
 * Servicio para prevenir navegación hacia atrás después del logout
 */
@Injectable({
  providedIn: 'root'
})
export class NavigationGuardService {
  private history: string[] = [];

  constructor(
    private router: Router,
    private location: Location
  ) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.history.push(event.urlAfterRedirects);
      });
  }

  /**
   * Previene la navegación hacia atrás
   * Debe llamarse en componentes protegidos
   */
  preventBackNavigation(): void {
    history.pushState(null, '', location.href);

    window.addEventListener('popstate', this.handlePopState);
  }

  /**
   * Limpia los listeners
   */
  clearBackNavigationPrevention(): void {
    window.removeEventListener('popstate', this.handlePopState);
  }

  private handlePopState = (event: PopStateEvent): void => {
    // Prevenir la navegación hacia atrás
    history.pushState(null, '', location.href);

    console.warn('⚠️ Navegación hacia atrás bloqueada. Por favor use los botones de la aplicación.');
  }

  /**
   * Limpia el historial de navegación
   */
  clearHistory(): void {
    this.history = [];
  }
}

