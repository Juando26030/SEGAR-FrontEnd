import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserProfileCardComponent } from '../user-profile-card/user-profile-card.component';
import { UserInfoComponent } from '../user-info/user-info.component';
import { UserStatCardComponent } from '../user-stat-card/user-stat-card.component';
import { UserEditComponent } from '../../user-edit/user-edit.component';
import { UserProfileService } from '../user-profile.service';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, UserProfileCardComponent, UserInfoComponent, UserStatCardComponent, UserEditComponent],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.css'
})
export class UserProfileComponent implements OnInit {
  showEditModal = false;
  tramitesActivos: number = 0;
  tramitesCompletados: number = 0;
  isLoadingStats: boolean = true;

  constructor(
    private userProfileService: UserProfileService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadUserStats();
  }

  loadUserStats(): void {
    this.authService.getUsuarioId().subscribe({
      next: (usuarioId: number | null) => {
        if (usuarioId) {
          this.userProfileService.getUserStats(usuarioId).subscribe({
            next: (stats) => {
              this.tramitesActivos = stats.tramitesActivos;
              this.tramitesCompletados = stats.tramitesCompletados;
              this.isLoadingStats = false;
            },
            error: (error: any) => {
              console.error('Error al cargar estadísticas del usuario:', error);
              this.isLoadingStats = false;
            }
          });
        } else {
          console.error('No se pudo obtener el ID del usuario');
          this.isLoadingStats = false;
        }
      },
      error: (error: any) => {
        console.error('Error al obtener el ID del usuario:', error);
        this.isLoadingStats = false;
      }
    });
  }

  openEditModal() {
    this.showEditModal = true;
  }

  closeEditModal() {
    this.showEditModal = false;
  }
}

