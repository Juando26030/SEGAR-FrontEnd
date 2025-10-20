import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';
import { UsuarioService } from '../../core/services/usuario.service';
import { Usuario } from '../../core/DTOs/usuario.dto';

@Component({
  selector: 'app-menu-lateral',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './menu-lateral.component.html',
  styleUrl: './menu-lateral.component.css'
})
export class MenuLateralComponent implements OnInit {
  userProfile = {
    name: '',
    role: '',
    initials: ''
  };

  constructor(
    private authService: AuthService,
    private usuarioService: UsuarioService
  ) {}

  ngOnInit(): void {
    this.loadUserProfile();
  }

  private loadUserProfile(): void {
    const userInfo = this.authService.getUser();

    if (!userInfo?.username) {
      console.warn('⚠️ No hay información de usuario');
      return;
    }

    console.log('👤 Cargando perfil de usuario desde token:', userInfo.username);

    // Usar datos del token de Keycloak directamente (más confiable)
    this.userProfile.name = userInfo.fullName || `${userInfo.firstName || ''} ${userInfo.lastName || ''}`.trim() || userInfo.username;
    this.userProfile.role = this.getRoleDisplayName(userInfo.roles || []);
    this.userProfile.initials = this.getInitials(this.userProfile.name);

    console.log('✅ Perfil cargado desde token:', this.userProfile);

    // Intentar obtener datos completos del backend (opcional, solo para enriquecer)
    this.usuarioService.getUsuarioByUsername(userInfo.username).subscribe({
      next: (usuario: Usuario) => {
        console.log('✅ Datos adicionales del backend obtenidos:', usuario);
        // Solo actualizar si hay datos más completos
        if (usuario.fullName) {
          this.userProfile.name = usuario.fullName;
          this.userProfile.initials = this.getInitials(usuario.fullName);
        }
        if (usuario.role) {
          this.userProfile.role = this.getRoleDisplayName([usuario.role]);
        }
      },
      error: (error) => {
        // No es crítico, ya tenemos datos del token
        console.log('ℹ️ No se pudieron obtener datos adicionales del backend (usando datos del token):', error.status);
      }
    });
  }

  private getRoleDisplayName(roles: string[]): string {
    if (!roles || roles.length === 0) return 'Usuario';

    const role = roles[0].toUpperCase();
    if (role.includes('ADMIN')) return 'Administrador';
    if (role.includes('EMPLEADO') || role.includes('EMPLOYEE')) return 'Empleado';
    if (role.includes('SUPERVISOR')) return 'Supervisor';

    return roles[0];
  }

  private getInitials(fullName: string): string {
    if (!fullName) return 'U';
    const names = fullName.trim().split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }
    return fullName.substring(0, 2).toUpperCase();
  }
}
