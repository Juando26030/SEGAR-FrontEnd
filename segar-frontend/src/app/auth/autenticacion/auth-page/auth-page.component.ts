import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthNavbarComponent } from '../auth-navbar/auth-navbar.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-auth-page',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, AuthNavbarComponent, CommonModule],
  templateUrl: './auth-page.component.html',
  styleUrl: './auth-page.component.css'
})
export class AuthPageComponent implements OnInit {
  currentRoute: string = '';

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Obtener la ruta actual
    this.currentRoute = this.router.url;
    
    // Escuchar cambios de ruta
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.currentRoute = event.url;
      });
  }

  isLoginPage(): boolean {
    return this.currentRoute.includes('/login') || this.currentRoute === '/auth' || this.currentRoute === '/auth/';
  }

  isRecoverPage(): boolean {
    return this.currentRoute.includes('/recover');
  }
}
