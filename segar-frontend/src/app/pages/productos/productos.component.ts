import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // 👈 IMPORTANTE
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../auth/services/auth.service';

@Component({
  selector: 'app-productos',
  standalone: true, // si usas standalone
  imports: [CommonModule], // ✅ Agrega CommonModule aquí
  templateUrl: './productos.component.html',
  styleUrls: ['./productos.component.css']
})
export class ProductosComponent implements OnInit {
  productos: any[] = [];
  cargando = false;
  error: string | null = null;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.obtenerProductos();
  }

  obtenerProductos() {
    this.cargando = true;
    this.error = null;

    const token = this.authService.getToken();
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http.get<any[]>('http://localhost:8090/api/producto/all', { headers })
      .subscribe({
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
}