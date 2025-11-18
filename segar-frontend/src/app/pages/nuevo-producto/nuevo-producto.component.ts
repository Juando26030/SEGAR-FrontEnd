import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ProductoService } from '../../core/services/producto.service';
import { AuthService } from '../../auth/services/auth.service';

@Component({
  selector: 'app-nuevo-producto',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './nuevo-producto.component.html',
  styleUrls: ['./nuevo-producto.component.css']
})
export class NuevoProductoComponent implements OnInit{

  // Estructura del JSON que quieres enviar (sin id, ya que se crea en el backend)
  producto = {
    nombre: '',
    descripcion: '',
    especificaciones: '',
    referencia: '',
    fabricante: '',
    empresaId: 1
  };

  token = '';

  constructor(private productoService: ProductoService, private router: Router, private authService: AuthService) {}
  ngOnInit(): void {
    this.token = this.authService.getToken()!;
  }

  guardarProducto() {
    this.productoService.createProducto(this.producto, this.token).subscribe({
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
