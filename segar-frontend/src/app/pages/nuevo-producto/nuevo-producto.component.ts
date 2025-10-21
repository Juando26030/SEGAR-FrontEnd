import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-nuevo-producto',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './nuevo-producto.component.html',
  styleUrls: ['./nuevo-producto.component.css']
})
export class NuevoProductoComponent {

  // Estructura del JSON que quieres enviar
  producto = {
    id: null,
    nombre: '',
    descripcion: '',
    especificaciones: '',
    referencia: '',
    fabricante: '',
    empresaId: 1
  };

  constructor(private http: HttpClient, private router: Router) {}

  guardarProducto() {
    const url = 'http://localhost:8090/api/producto/create';
    this.http.post(url, this.producto).subscribe({
      next: (response) => {
        console.log('✅ Producto creado correctamente:', response);
        this.router.navigate(['/main/productos']);
      },
      error: (error) => {
        console.error('❌ Error al crear el producto:', error);
        alert('Ocurrió un error al guardar el producto.');
      }
    });
  }

  cancelar() {
    this.router.navigate(['/main/productos']);
  }
}
