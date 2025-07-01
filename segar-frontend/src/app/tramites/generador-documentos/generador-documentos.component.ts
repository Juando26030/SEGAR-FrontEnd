import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

type DocumentoPlantilla = {
  categoria: string;
  nombre: string;
  campos: Campo[];
};

type Campo = {
  etiqueta: string;
  tipo: 'texto' | 'textarea' | 'numero' | 'fecha' | 'seleccion';
  opciones?: string[];
  valor?: any;
};

@Component({
  standalone: true,
  selector: 'app-generador-documentos',
  imports: [CommonModule, FormsModule],
  templateUrl: './generador-documentos.component.html',
  styleUrls: ['./generador-documentos.component.css']
})
export class GeneradorDocumentosComponent {
  categorias = ['Documentación Técnica', 'Documentación Legal', 'Administrativa', 'Sistema de Calidad'];

  plantillas: DocumentoPlantilla[] = [
    {
      categoria: 'Documentación Técnica',
      nombre: 'Ficha Técnica del Producto',
      campos: [
        { etiqueta: 'Nombre del producto', tipo: 'texto' },
        { etiqueta: 'Marca comercial', tipo: 'texto' },
        { etiqueta: 'Presentación', tipo: 'texto' },
        { etiqueta: 'Vida útil (meses)', tipo: 'numero' },
        { etiqueta: 'Descripción', tipo: 'textarea' },
        { etiqueta: 'Ingredientes', tipo: 'textarea' },
        { etiqueta: 'Aditivos', tipo: 'textarea' },
        { etiqueta: 'Información Nutricional', tipo: 'textarea' }
      ]
    },
    {
      categoria: 'Documentación Técnica',
      nombre: 'Composición Cualitativa-Cuantitativa',
      campos: [
        { etiqueta: 'Ingredientes', tipo: 'textarea' },
        { etiqueta: 'Porcentajes', tipo: 'textarea' }
      ]
    },
    {
      categoria: 'Documentación Técnica',
      nombre: 'Descripción del Proceso de Fabricación',
      campos: [
        { etiqueta: 'Diagrama de Flujo', tipo: 'textarea' },
        { etiqueta: 'Parámetros de Control', tipo: 'textarea' }
      ]
    },
    {
      categoria: 'Documentación Legal',
      nombre: 'Certificado de Representación Legal',
      campos: [
        { etiqueta: 'Nombre del Representante Legal', tipo: 'texto' },
        { etiqueta: 'Número de Documento', tipo: 'texto' },
        { etiqueta: 'Fecha de Emisión', tipo: 'fecha' }
      ]
    },
    {
      categoria: 'Sistema de Calidad',
      nombre: 'Plan HACCP',
      campos: [
        { etiqueta: 'Peligros Identificados', tipo: 'textarea' },
        { etiqueta: 'Puntos Críticos de Control', tipo: 'textarea' },
        { etiqueta: 'Medidas Preventivas', tipo: 'textarea' }
      ]
    }
  ];

  categoriaSeleccionada: string = '';
  plantillaSeleccionada?: DocumentoPlantilla;

  get plantillasFiltradas(): DocumentoPlantilla[] {
    return this.plantillas.filter(p => p.categoria === this.categoriaSeleccionada);
  }

  seleccionarCategoria(categoria: string) {
    this.categoriaSeleccionada = categoria;
    this.plantillaSeleccionada = undefined;
  }

  seleccionarPlantilla(plantilla: DocumentoPlantilla) {
    this.plantillaSeleccionada = {
      ...plantilla,
      campos: plantilla.campos.map(c => ({ ...c }))
    };
  }

  exportar() {
    console.log('Datos para generar PDF:', this.plantillaSeleccionada);
    alert('Funcionalidad de exportación simulada.');
  }
}
