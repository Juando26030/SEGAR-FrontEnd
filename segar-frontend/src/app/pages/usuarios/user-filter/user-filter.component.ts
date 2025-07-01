import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-filter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-filter.component.html',
  styleUrl: './user-filter.component.css'
})
export class UserFilterComponent {
  @Output() search = new EventEmitter<string>();
  @Output() filterRole = new EventEmitter<string>();
  @Output() filterStatus = new EventEmitter<string>();

  searchTerm = '';
  selectedRole = '';
  selectedStatus = '';

  onSearchChange() {
    this.search.emit(this.searchTerm);
  }

  onRoleChange() {
    this.filterRole.emit(this.selectedRole);
  }

  onStatusChange() {
    this.filterStatus.emit(this.selectedStatus);
  }
}
