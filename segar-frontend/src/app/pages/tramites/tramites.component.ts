import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TramiteService } from '../../core/services/tramite.service';

@Component({
  selector: 'app-tramites',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tramites.component.html',
  styleUrls: ['./tramites.component.css']
})
export class TramitesComponent implements OnInit {
  tramites: any[] = [];
  cargando = false;
  error: string | null = null;

  constructor(
    private tramiteService: TramiteService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.obtenerTramites();
  }

  obtenerTramites() {
    this.cargando = true;
    this.error = null;

    this.tramiteService.getAllTramites().subscribe({
      next: (data) => {
        this.tramites = data;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al obtener tramites:', err);
        this.error = 'No se pudieron cargar los tramites.';
        this.cargando = false;
      }
    });
  }

  irANuevoTramite() {
    this.router.navigate(['main/nuevo/tramite']);
  }
}
