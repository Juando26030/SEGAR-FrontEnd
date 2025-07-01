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
  selector: 'app-user-delete-confirm',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-delete-confirm.component.html',
  styleUrl: './user-delete-confirm.component.css'
})
export class UserDeleteConfirmComponent {
  @Input() isVisible = false;
  @Input() user: User | null = null;
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  onConfirm() {
    this.confirm.emit();
  }

  onCancel() {
    this.cancel.emit();
  }
}
