import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-nuevo-tramite',
  imports: [CommonModule, RouterLink],
  templateUrl: './nuevo-tramite.component.html',
  styleUrls: ['./nuevo-tramite.component.css']  // Asegúrate de que esté aquí

})
export class NuevoTramiteComponent {
  constructor(private router: Router) {}

  seleccionar(tipo: 'registro' | 'renovacion' | 'modificacion') {
    switch (tipo) {
      case 'registro':
        this.router.navigate(['/main/nuevo/registro/paso-1']);
        break;
      case 'renovacion':
        this.router.navigate(['/main/nuevo/renovacion/paso-1']);
        break;
      case 'modificacion':
        alert(`Has seleccionado: ${tipo}. En la próxima versión se mostrará el formulario correspondiente.`);
        break;
    }
  }


}
