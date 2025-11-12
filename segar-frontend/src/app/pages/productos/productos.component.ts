import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProductoService } from '../../core/services/producto.service';
import { ProductoDetalleModalComponent } from '../../shared/producto-detalle-modal/producto-detalle-modal.component';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [CommonModule, ProductoDetalleModalComponent],
  templateUrl: './productos.component.html',
  styleUrls: ['./productos.component.css']
})
export class ProductosComponent implements OnInit {
  productos: any[] = [];
  cargando = false;
  error: string | null = null;

  // Propiedades para el modal
  modalVisible: boolean = false;
  productoSeleccionadoId: number | null = null;

  constructor(
    private productoService: ProductoService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.obtenerProductos();
  }

  obtenerProductos() {
    this.cargando = true;
    this.error = null;

    this.productoService.getAllProductos().subscribe({
      next: (data) => {
        this.productos = data;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al obtener productos:', err);
        this.error = 'No se pudieron cargar los productos.';
        this.cargando = false;
      }
    });
  }

  irANuevoProducto() {
    this.router.navigate(['main/nuevo/producto']);
  }

  verDetalleProducto(producto: any): void {
    this.productoSeleccionadoId = producto.id;
    this.modalVisible = true;
  }

  cerrarModal(): void {
    this.modalVisible = false;
    this.productoSeleccionadoId = null;
  }

  eliminarProducto(producto: any, event: Event): void {
    event.stopPropagation();

    const confirmacion = confirm(
      `¿Está seguro de eliminar el producto "${producto.nombre}"?\n\n` +
      `Esta acción no se puede deshacer.`
    );

    if (confirmacion) {
      this.cargando = true;
      this.productoService.deleteProducto(producto.id).subscribe({
        next: () => {
          this.productos = this.productos.filter(p => p.id !== producto.id);
          this.cargando = false;
          alert('Producto eliminado exitosamente');
        },
        error: (err) => {
          console.error('Error al eliminar producto:', err);
          this.cargando = false;
          alert('Error al eliminar el producto. Por favor, intente nuevamente.');
        }
      });
    }
  }
}
