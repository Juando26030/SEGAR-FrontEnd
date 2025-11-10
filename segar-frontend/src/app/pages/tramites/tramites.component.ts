import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TramiteService } from '../../core/services/tramite.service';
import { TramiteDto } from '../../core/DTOs/tramite.dto';
import { DocumentService } from "../../core/services/document.service";
import { AuthService } from '../../auth/services/auth.service';


@Component({
  selector: 'app-tramites',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tramites.component.html',
  styleUrls: ['./tramites.component.css']
})
export class TramitesComponent implements OnInit {
  tramites: any[] = [];
  cargando = false;
  error: string | null = null;
  cantidadAprobados: number = 0;


  mostrarModal: boolean = false;
  documentos: Array<{ nombre: string }> = [];
  tramiteSeleccionado: any = null; // Variable para almacenar el trámite seleccionado

  constructor(
    private tramiteService: TramiteService,
    private router: Router,
    private documentService: DocumentService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.obtenerTramites();
  }

  obtenerTramites() {
    this.cargando = true;
    this.error = null;

    this.tramiteService.getAllTramites().subscribe({
      next: (data) => {
        this.tramites = data;
        this.cargando = false;
        for (let tramite of data) {
          if (Array.isArray(tramite.eventos) && tramite.eventos.length > 3) {
            const evento = tramite.eventos[3];
            if (evento.completed === true && evento.currentEvent === true) {
              this.cantidadAprobados++;
            }
          }
        }
      },
      error: (err) => {
        console.error('Error al obtener tramites:', err);
        this.error = 'No se pudieron cargar los tramites.';
        this.cargando = false;
      }
    });
  }

  irANuevoTramite() {
    this.router.navigate(['main/nuevo/tramite']);
  }

  abrirModal(documentos: Array<{ nombre: string }>, tramite: any) {
    console.log('Trámite seleccionado:', tramite);
    this.tramiteSeleccionado = tramite;
    this.documentos = documentos;
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.documentos = [];
  }

  onDocumentoClick(documento: any) {
    console.log('Documento seleccionado:', documento);
    const token = this.authService.getToken();
    this.documentService.getSignedUrl(documento.bucketName, documento.objectName, documento.contentType, token!).subscribe({
      next: (response: string) => {
        // Si la respuesta es directamente la URL
        window.open(response, '_blank');
      },
      error: (err) => {
        console.error('Error al obtener la URL firmada del documento:', err);
        alert('No se pudo abrir el documento.');
      }
    });
  }
}
