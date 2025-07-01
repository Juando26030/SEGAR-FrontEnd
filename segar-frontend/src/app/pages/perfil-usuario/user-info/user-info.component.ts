import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-info',
  imports: [CommonModule],
  templateUrl: './user-info.component.html',
  styleUrl: './user-info.component.css'
})
export class UserInfoComponent {
  userInfo = {
    personalInfo: {
      firstName: 'Juan',
      lastName: 'Díaz',
      fullName: 'Juan Díaz',
      idType: 'DNI',
      idNumber: '12345678',
      birthDate: '15 de Enero, 1990',
      gender: 'Masculino',
      email: 'juan.diaz@tramitespro.com',
      phone: '+1 (555) 123-4567',
      altPhone: '+1 (555) 987-6543',
      address: 'Calle Principal 123',
      city: 'Ciudad Principal',
      postalCode: '12345'
    },
    accountInfo: {
      username: 'juan.diaz',
      employeeId: 'EMP-001',
      role: 'Administrador',
      department: 'Tecnología',
      position: 'Administrador de Sistemas',
      manager: 'María González',
      startDate: '15 de Marzo, 2023',
      workLocation: 'Oficina Principal'
    },
    permissions: [
      { name: 'Gestión de Usuarios', granted: true },
      { name: 'Configuración del Sistema', granted: true },
      { name: 'Reportes Avanzados', granted: true },
      { name: 'Gestión de Trámites', granted: false },
      { name: 'Auditoría', granted: true }
    ]
  };

  recentActivity = [
    {
      action: 'Actualizó información de perfil',
      date: 'Hace 2 horas',
      type: 'profile'
    },
    {
      action: 'Creó nuevo usuario: Ana Martín',
      date: 'Hace 1 día',
      type: 'user'
    },
    {
      action: 'Configuró nuevos permisos de sistema',
      date: 'Hace 3 días',
      type: 'system'
    },
    {
      action: 'Generó reporte mensual',
      date: 'Hace 1 semana',
      type: 'report'
    }
  ];
}
