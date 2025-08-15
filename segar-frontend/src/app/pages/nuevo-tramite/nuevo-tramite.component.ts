import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-nuevo-tramite',
  imports: [CommonModule],
  templateUrl: './nuevo-tramite.component.html',
})
export class NuevoTramiteComponent {
  constructor(private router: Router) {}

  seleccionar(tipo: 'registro' | 'renovacion' | 'modificacion') {
    if (tipo === 'registro') {
      // Navegar al paso 1 del registro de trámites
      this.router.navigate(['/main/nuevo/registro/paso-1']);
    } else {
      // Para otros tipos, mostrar mensaje temporal
      alert(`Has seleccionado: ${tipo}. En la próxima versión se mostrará el formulario correspondiente.`);
    }
  }
}
