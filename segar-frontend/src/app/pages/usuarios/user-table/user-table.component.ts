import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'Activo' | 'Inactivo';
  createdDate: string;
  initials: string;
}

@Component({
  selector: 'app-user-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-table.component.html',
  styleUrl: './user-table.component.css'
})
export class UserTableComponent {
  @Input() users: User[] = [];
  @Input() currentPage = 1;
  @Input() totalPages = 1;
  @Input() totalResults = 0;
  
  @Output() editUser = new EventEmitter<User>();
  @Output() deleteUser = new EventEmitter<User>();
  @Output() pageChange = new EventEmitter<number>();

  onEdit(user: User) {
    this.editUser.emit(user);
  }

  onDelete(user: User) {
    this.deleteUser.emit(user);
  }

  onPageClick(page: number) {
    this.pageChange.emit(page);
  }

  getPages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  getRoleColor(role: string): string {
    switch (role) {
      case 'Administrador':
        return 'bg-purple-100 text-purple-800';
      case 'Editor':
        return 'bg-blue-100 text-blue-800';
      case 'Visualizador':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'Activo':
        return 'bg-green-100 text-green-800';
      case 'Inactivo':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getEndIndex(): number {
    return Math.min(this.currentPage * 12, this.totalResults);
  }
}
