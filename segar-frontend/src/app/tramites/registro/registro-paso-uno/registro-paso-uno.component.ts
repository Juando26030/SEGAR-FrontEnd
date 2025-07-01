import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-registro-paso-uno',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './registro-paso-uno.component.html',
  styleUrls: ['./registro-paso-uno.component.css']
})
export class RegistroPasoUnoComponent {
  cards = [
    {
      title: 'Clasificación del Producto',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>`,
      items: [
        'Identificar la categoría del alimento según normativa',
        'Determinar el riesgo sanitario (alto, medio, bajo)',
        'Verificar si requiere registro, permiso o notificación sanitaria',
        'Consultar la normativa específica aplicable'
      ]
    },
    {
      title: 'Documentación Técnica',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>`,
      items: [
        'Preparar ficha técnica del producto',
        'Desarrollar composición cualitativa y cuantitativa',
        'Elaborar descripción del proceso de fabricación',
        'Definir especificaciones fisicoquímicas y microbiológicas'
      ]
    },
    {
      title: 'Requisitos Legales',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
      </svg>`,
      items: [
        'Verificar certificado de existencia y representación legal',
        'Preparar poder debidamente otorgado (si aplica)',
        'Obtener certificado de venta libre (para productos importados)',
        'Verificar cumplimiento de BPM (Buenas Prácticas de Manufactura)'
      ]
    },
    {
      title: 'Etiquetado y Rotulado',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>`,
      items: [
        'Diseñar etiquetas según Resolución 5109 de 2005 y 333 de 2011',
        'Incluir información nutricional obligatoria',
        'Verificar declaraciones de propiedades nutricionales',
        'Preparar artes finales de etiquetas para presentación'
      ]
    }
  ];

  nextSteps = [
    {
      title: 'Creación de cuenta en plataforma INVIMA',
      desc: 'Registrarse en el sistema de información sanitaria para trámites en línea.'
    },
    {
      title: 'Pago de tarifas correspondientes',
      desc: 'Consultar y realizar el pago de las tarifas vigentes según el tipo de trámite.'
    },
    {
      title: 'Radicación de la solicitud',
      desc: 'Presentar formalmente la solicitud con toda la documentación requerida.'
    }
  ];
}
