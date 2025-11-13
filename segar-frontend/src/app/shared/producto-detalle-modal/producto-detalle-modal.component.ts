import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductoService } from '../../core/services/producto.service';
import { Producto } from '../../core/DTOs/solicitud.dto';

@Component({
  selector: 'app-producto-detalle-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './producto-detalle-modal.component.html',
  styleUrls: ['./producto-detalle-modal.component.css']
})
export class ProductoDetalleModalComponent implements OnChanges {
  @Input() productoId: number | null = null;
  @Input() isVisible: boolean = false;
  @Output() cerrar = new EventEmitter<void>();

  detalle: Producto | null = null;
  isLoading: boolean = false;
  error: string | null = null;

  constructor(private productoService: ProductoService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['productoId'] && this.productoId && this.isVisible) {
      this.cargarDetalle();
    }

    if (changes['isVisible'] && this.isVisible && this.productoId) {
      this.cargarDetalle();
    }
  }

  cargarDetalle(): void {
    if (!this.productoId) return;

    this.isLoading = true;
    this.error = null;

    console.log('Cargando detalle para producto ID:', this.productoId);

    this.productoService.getProductoPorId(this.productoId).subscribe({
      next: (detalle: Producto) => {
        console.log('Detalle del producto recibido:', detalle);
        this.detalle = detalle;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error cargando detalle del producto:', error);
        this.error = 'Error al cargar los detalles del producto';
        this.isLoading = false;
      }
    });
  }

  cerrarModal(): void {
    this.cerrar.emit();
    this.detalle = null;
    this.error = null;
  }
}

