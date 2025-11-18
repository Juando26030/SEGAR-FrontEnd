import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../auth/services/auth.service';
import { UsuarioService } from '../../../core/services/usuario.service';
import { Usuario } from '../../../core/DTOs/usuario.dto';

@Component({
  selector: 'app-user-info',
  imports: [CommonModule],
  templateUrl: './user-info.component.html',
  styleUrl: './user-info.component.css'
})
export class UserInfoComponent implements OnInit {
  userInfo = {
    personalInfo: {
      firstName: '',
      lastName: '',
      fullName: '',
      idType: '',
      idNumber: '',
      birthDate: '',
      gender: '',
      email: '',
      phone: '',
      altPhone: '',
      address: '',
      city: '',
      postalCode: ''
    },
    accountInfo: {
      username: '',
      employeeId: '',
      role: '',
      department: 'Tecnología',
      position: '',
      manager: 'No asignado',
      startDate: '',
      workLocation: 'Oficina Principal'
    },
    permissions: [] as { name: string; granted: boolean }[]
  };

  recentActivity = [
    {
      action: 'Actualizó información de perfil',
      date: 'Hace 2 horas',
      type: 'profile'
    },
    {
      action: 'Accedió al sistema',
      date: 'Hoy',
      type: 'system'
    }
  ];

  loading = true;
  token = '';

  constructor(
    private authService: AuthService,
    private usuarioService: UsuarioService
  ) {}

  ngOnInit(): void {
    this.loadUserData();
  }

  private loadUserData(): void {
    const userInfo = this.authService.getUser();

    if (!userInfo?.username) {
      console.warn('⚠️ No hay información de usuario');
      this.loading = false;
      return;
    }

    this.usuarioService.getUsuarioByUsername(userInfo.username, this.token).subscribe({
      next: (usuario: Usuario) => {
        this.updateUserInfo(usuario);
        this.loading = false;
      },
      error: (error) => {
        console.error('❌ Error al cargar datos del usuario:', error);
        this.loading = false;
      }
    });
  }

  private updateUserInfo(usuario: Usuario): void {
    // Información Personal
    this.userInfo.personalInfo = {
      firstName: usuario.firstName,
      lastName: usuario.lastName,
      fullName: usuario.fullName,
      idType: usuario.idType,
      idNumber: usuario.idNumber,
      birthDate: this.formatDate(usuario.birthDate),
      gender: usuario.gender,
      email: usuario.email,
      phone: usuario.phone,
      altPhone: usuario.altPhone,
      address: usuario.address,
      city: usuario.city,
      postalCode: usuario.postalCode
    };

    // Información de Cuenta
    this.userInfo.accountInfo = {
      username: usuario.username,
      employeeId: usuario.employeeId,
      role: this.getRoleDisplayName(usuario.roles || [usuario.role]),
      department: 'Tecnología',
      position: usuario.role,
      manager: 'No asignado',
      startDate: this.formatDate(usuario.fechaRegistro),
      workLocation: 'Oficina Principal'
    };

    // Permisos basados en roles
    this.userInfo.permissions = this.generatePermissions(usuario.roles || [usuario.role]);
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
      return 'No disponible';
    }
  }

  private getRoleDisplayName(roles: string[]): string {
    if (!roles || roles.length === 0) return 'Usuario';

    const role = roles[0].toUpperCase();
    if (role.includes('ADMIN')) return 'Administrador';
    if (role.includes('EMPLEADO') || role.includes('EMPLOYEE')) return 'Empleado';

    return roles[0];
  }

  private generatePermissions(roles: string[]): { name: string; granted: boolean }[] {
    const isAdmin = roles.some(r => r.toUpperCase().includes('ADMIN'));

    return [
      { name: 'Gestión de Usuarios', granted: isAdmin },
      { name: 'Configuración del Sistema', granted: isAdmin },
      { name: 'Reportes Avanzados', granted: isAdmin },
      { name: 'Gestión de Trámites', granted: true },
      { name: 'Auditoría', granted: isAdmin }
    ];
  }
}
