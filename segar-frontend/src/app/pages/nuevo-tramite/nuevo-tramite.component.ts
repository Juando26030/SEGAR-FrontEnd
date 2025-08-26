import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-nuevo-tramite',
  imports: [CommonModule, RouterLink],
  templateUrl: './nuevo-tramite.component.html',
})
export class NuevoTramiteComponent {
  constructor(private router: Router) {}

  seleccionar(tipo: 'registro' | 'renovacion' | 'modificacion') {
    if (tipo === 'registro') {
      // Navegar directamente al paso 3 (ahora el primer paso del proceso de registro)
      this.router.navigate(['/main/nuevo/registro/paso-3']);
    } else {
      // Para otros tipos, mostrar mensaje temporal
      alert(`Has seleccionado: ${tipo}. En la próxima versión se mostrará el formulario correspondiente.`);
    }
  }
}
