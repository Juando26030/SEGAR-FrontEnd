import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProductoService } from '../../core/services/producto.service';
import { ProductoDetalleModalComponent } from '../../shared/producto-detalle-modal/producto-detalle-modal.component';
import { AuthService } from '../../auth/services/auth.service';
import { UsuarioService } from '../../core/services/usuario.service';

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
  empresaId: number | null = null;

  // Propiedades para el modal
  modalVisible: boolean = false;
  productoSeleccionadoId: number | null = null;

  token = '';

  constructor(
    private productoService: ProductoService,
    private router: Router,
    private authService: AuthService,
    private usuarioService: UsuarioService
  ) {}

  ngOnInit(): void {
    this.token = this.authService.getToken()!;
    this.cargarProductosDeEmpresa();
  }

  private cargarProductosDeEmpresa(): void {
    this.cargando = true;
    this.error = null;

    this.authService.getUsuarioId().subscribe({
      next: (usuarioId) => {
        if (usuarioId) {
          this.usuarioService.getEmpresaByUsuarioId(usuarioId, this.token).subscribe({
            next: (empresa) => {
              this.empresaId = empresa.id;
              this.obtenerProductos();
            },
            error: (err) => {
              console.error('Error al obtener empresa del usuario:', err);
              this.error = 'No se pudo obtener la información de la empresa.';
              this.cargando = false;
            }
          });
        } else {
          this.error = 'No se pudo identificar al usuario.';
          this.cargando = false;
        }
      },
      error: (err) => {
        console.error('Error al obtener usuario:', err);
        this.error = 'No se pudo obtener la información del usuario.';
        this.cargando = false;
      }
    });
  }

  private obtenerProductos(): void {
    if (!this.empresaId) {
      this.error = 'No se pudo identificar la empresa.';
      this.cargando = false;
      return;
    }

    this.productoService.getProductosByEmpresaId(this.empresaId, this.token).subscribe({
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

  irANuevoProducto(): void {
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
      this.productoService.deleteProducto(producto.id, this.token).subscribe({
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
