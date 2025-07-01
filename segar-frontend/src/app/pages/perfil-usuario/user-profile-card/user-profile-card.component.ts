import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-profile-card',
  imports: [CommonModule],
  templateUrl: './user-profile-card.component.html',
  styleUrl: './user-profile-card.component.css'
})
export class UserProfileCardComponent {
  user = {
    name: 'Juan Díaz',
    email: 'juan.diaz@tramitespro.com',
    role: 'Administrador',
    department: 'Tecnología',
    joinDate: '15 Marzo 2023',
    avatar: '', // Will use initials instead
    initials: 'JD'
  };
}
