import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserFilterComponent } from '../user-filter/user-filter.component';
import { UserTableComponent } from '../user-table/user-table.component';
import { UserDeleteConfirmComponent } from '../user-delete-confirm/user-delete-confirm.component';

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
  selector: 'app-user-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    UserFilterComponent,
    UserTableComponent,
    UserDeleteConfirmComponent
  ],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.css'
})
export class UserManagementComponent {
  users: User[] = [
    {
      id: '1',
      name: 'Juan Díaz',
      email: 'juan.diaz@ejemplo.com',
      role: 'Administrador',
      status: 'Activo',
      createdDate: '15/05/2023',
      initials: 'JD'
    },
    {
      id: '2',
      name: 'María López',
      email: 'maria.lopez@ejemplo.com',
      role: 'Editor',
      status: 'Activo',
      createdDate: '03/06/2023',
      initials: 'ML'
    },
    {
      id: '3',
      name: 'Carlos Rodríguez',
      email: 'carlos.rodriguez@ejemplo.com',
      role: 'Visualizador',
      status: 'Inactivo',
      createdDate: '22/04/2023',
      initials: 'CR'
    }
  ];

  filteredUsers: User[] = [...this.users];
  showDeleteModal = false;
  userToDelete: User | null = null;

  // Filtros
  searchTerm = '';
  selectedRole = '';
  selectedStatus = '';

  // Paginación
  currentPage = 1;
  itemsPerPage = 12;
  totalPages = 1;

  constructor(private router: Router) {
    this.updatePagination();
  }

  onSearch(searchTerm: string) {
    this.searchTerm = searchTerm;
    this.applyFilters();
  }

  onFilterRole(role: string) {
    this.selectedRole = role;
    this.applyFilters();
  }

  onFilterStatus(status: string) {
    this.selectedStatus = status;
    this.applyFilters();
  }

  private applyFilters() {
    this.filteredUsers = this.users.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                           user.email.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesRole = !this.selectedRole || user.role === this.selectedRole;
      const matchesStatus = !this.selectedStatus || user.status === this.selectedStatus;
      
      return matchesSearch && matchesRole && matchesStatus;
    });
    
    this.currentPage = 1;
    this.updatePagination();
  }

  private updatePagination() {
    this.totalPages = Math.ceil(this.filteredUsers.length / this.itemsPerPage);
  }

  get paginatedUsers(): User[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredUsers.slice(startIndex, endIndex);
  }

  onPageChange(page: number) {
    this.currentPage = page;
  }

  onEditUser(user: User) {
    console.log('Editar usuario:', user);
    // Implementar navegación a edición
  }

  onDeleteUser(user: User) {
    this.userToDelete = user;
    this.showDeleteModal = true;
  }

  onConfirmDelete() {
    if (this.userToDelete) {
      this.users = this.users.filter(u => u.id !== this.userToDelete!.id);
      this.applyFilters();
      this.closeDeleteModal();
    }
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.userToDelete = null;
  }

  onNewUser() {
    this.router.navigate(['/main/nuevo-usuario']);
  }
}
