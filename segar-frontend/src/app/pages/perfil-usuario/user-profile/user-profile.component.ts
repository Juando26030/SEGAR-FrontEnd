import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserProfileCardComponent } from '../user-profile-card/user-profile-card.component';
import { UserInfoComponent } from '../user-info/user-info.component';
import { UserStatCardComponent } from '../user-stat-card/user-stat-card.component';
import { UserEditComponent } from '../../user-edit/user-edit.component';

@Component({
  selector: 'app-user-profile',
  imports: [CommonModule, UserProfileCardComponent, UserInfoComponent, UserStatCardComponent, UserEditComponent],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.css'
})
export class UserProfileComponent {
  showEditModal = false;

  openEditModal() {
    this.showEditModal = true;
  }

  closeEditModal() {
    this.showEditModal = false;
  }
}
