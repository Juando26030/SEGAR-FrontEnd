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
    alert(`Has seleccionado: ${tipo}. En la próxima versión se mostrará el formulario correspondiente.`);

    // Ejemplo de navegación futura:
    // this.router.navigate(['/nuevo', tipo]);
  }
}
