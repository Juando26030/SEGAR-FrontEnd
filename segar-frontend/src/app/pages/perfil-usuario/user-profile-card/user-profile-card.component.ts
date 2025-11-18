import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService, UserInfo } from '../../../auth/services/auth.service';
import { UsuarioService } from '../../../core/services/usuario.service';
import { Usuario } from '../../../core/DTOs/usuario.dto';

@Component({
  selector: 'app-user-profile-card',
  imports: [CommonModule],
  templateUrl: './user-profile-card.component.html',
  styleUrl: './user-profile-card.component.css'
})
export class UserProfileCardComponent implements OnInit {
  user = {
    name: '',
    email: '',
    role: '',
    department: 'Tecnología',
    joinDate: '',
    avatar: '',
    initials: ''
  };

  token = '';

  constructor(
    private authService: AuthService,
    private usuarioService: UsuarioService
  ) {}

  ngOnInit(): void {
    this.token = this.authService.getToken()!;
    this.loadUserProfile();
  }

  private loadUserProfile(): void {
    const userInfo = this.authService.getUser();

    if (!userInfo?.username) {
      console.warn('⚠️ No hay información de usuario en el token');
      return;
    }

    // Cargar datos completos del backend
    this.usuarioService.getUsuarioByUsername(userInfo.username, this.token).subscribe({
      next: (usuario: Usuario) => {
        this.user.name = usuario.fullName;
        this.user.email = usuario.email;
        this.user.role = this.getRoleDisplayName(usuario.roles || [usuario.role]);
        this.user.initials = this.getInitials(usuario.fullName);
        this.user.joinDate = this.formatDate(usuario.fechaRegistro);
      },
      error: (error) => {
        console.error('❌ Error al cargar usuario del backend:', error);
        // Fallback: usar datos del token
        this.updateUserDataFromToken(userInfo);
      }
    });
  }

  private updateUserDataFromToken(userInfo: UserInfo): void {
    this.user.name = userInfo.fullName || userInfo.username;
    this.user.email = userInfo.email;
    this.user.role = this.getRoleDisplayName(userInfo.roles);
    this.user.initials = this.getInitials(userInfo.fullName);
    this.user.joinDate = this.getJoinDateFromToken(userInfo.createdAt);
  }

  private getRoleDisplayName(roles: string[]): string {
    if (!roles || roles.length === 0) return 'Usuario';

    const role = roles[0].toUpperCase();
    if (role.includes('ADMIN')) return 'Administrador';
    if (role.includes('EMPLEADO') || role.includes('EMPLOYEE')) return 'Empleado';

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

  private formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return 'Fecha no disponible';
    }
  }

  private getJoinDateFromToken(createdAt?: Date): string {
    if (createdAt) {
      return createdAt.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    }
    return 'Fecha no disponible';
  }
}
