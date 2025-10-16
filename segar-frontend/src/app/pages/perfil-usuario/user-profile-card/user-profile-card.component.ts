import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService, UserInfo } from '../../../auth/services/auth.service';

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

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // Subscribirse a cambios
    this.authService.user$.subscribe(userInfo => {
      if (userInfo) {
        this.updateUserData(userInfo);
      }
    });
  }

  private updateUserData(userInfo: UserInfo): void {
    this.user.name = userInfo.fullName || userInfo.username;
    this.user.email = userInfo.email;
    this.user.role = this.getRoleDisplayName(userInfo.roles);
    this.user.initials = this.getInitials(userInfo.fullName);
    this.user.joinDate = this.getJoinDate(); // Extraer del token si está disponible
  }

  private getRoleDisplayName(roles: string[]): string {
    if (roles.includes('ADMIN') || roles.includes('Admin')) {
      return 'Administrador';
    }
    if (roles.includes('EMPLEADO') || roles.includes('Empleado')) {
      return 'Empleado';
    }
    return roles[0] || 'Usuario';
  }

  private getInitials(fullName: string): string {
    if (!fullName) return 'U';
    const names = fullName.trim().split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }
    return fullName.substring(0, 2).toUpperCase();
  }

  private getJoinDate(): string {
    const user = this.authService.getUser();

    // Si existe createdAt en el token, usarlo
    if (user?.createdAt) {
      return user.createdAt.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    }

    // Si no hay createdAt, retornar mensaje por defecto
    return 'Fecha no disponible';
  }
}
