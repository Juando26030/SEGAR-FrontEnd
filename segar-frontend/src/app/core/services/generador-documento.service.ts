import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import {
  TipoDocumentoInvimaDTO,
  DocumentoGeneradoDTO,
  DocumentoRequestDTO,
  DocumentoResponseDTO,
  ProductoAlimentarioDTO
} from '../DTOs/documento-generator.dto';

@Injectable({
  providedIn: 'root'
})
export class DocumentGeneratorService {
  private readonly API_URL = 'http://localhost:8080/api';

  // Estado del componente
  private documentosDisponiblesSubject = new BehaviorSubject<TipoDocumentoInvimaDTO[]>([]);
  private documentosGeneradosSubject = new BehaviorSubject<DocumentoGeneradoDTO[]>([]);

  public documentosDisponibles$ = this.documentosDisponiblesSubject.asObservable();
  public documentosGenerados$ = this.documentosGeneradosSubject.asObservable();

  constructor(private http: HttpClient) {
    this.cargarDocumentosMock();
  }

  // Métodos para obtener documentos disponibles
  obtenerDocumentosDisponibles(categoriaProducto?: string): Observable<TipoDocumentoInvimaDTO[]> {
    // Por ahora retorna datos mock, luego se conectará con el backend
    return this.documentosDisponibles$;
  }

  obtenerDocumentosPorCategoria(categoria: string): Observable<TipoDocumentoInvimaDTO[]> {
    return this.http.get<TipoDocumentoInvimaDTO[]>(`${this.API_URL}/documentos/categoria/${categoria}`);
  }

  // Métodos para generar documentos
  generarDocumento(request: DocumentoRequestDTO): Observable<DocumentoResponseDTO> {
    return this.http.post<DocumentoResponseDTO>(`${this.API_URL}/documentos/generar`, request);
  }

  previsualizarDocumento(tipoDocumento: string, datos: any): Observable<string> {
    return this.http.post<string>(`${this.API_URL}/documentos/previsualizar`, {
      tipoDocumento,
      datos
    });
  }

  // Métodos para gestionar documentos generados
  obtenerDocumentosGenerados(idTramite: number): Observable<DocumentoGeneradoDTO[]> {
    return this.http.get<DocumentoGeneradoDTO[]>(`${this.API_URL}/documentos/tramite/${idTramite}`);
  }

  actualizarDocumento(idDocumento: number, datos: any): Observable<DocumentoGeneradoDTO> {
    return this.http.put<DocumentoGeneradoDTO>(`${this.API_URL}/documentos/${idDocumento}`, datos);
  }

  eliminarDocumento(idDocumento: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/documentos/${idDocumento}`);
  }

  // Método para cargar datos mock (temporal)
  private cargarDocumentosMock(): void {
    const documentosMock: TipoDocumentoInvimaDTO[] = [
      {
        idTipoDocumento: 1,
        codigo: 'FTP-001',
        nombre: 'Ficha Técnica del Producto',
        descripcion: 'Documento técnico que describe las características del producto alimentario',
        categoria: 'TECNICO',
        obligatorio: true,
        aplicaA: ['GALLETAS', 'CEREALES', 'SNACKS'],
        version: '1.0',
        fechaVigencia: new Date('2024-12-31'),
        plantilla: {
          idPlantilla: 1,
          nombre: 'Plantilla Ficha Técnica',
          version: '1.0',
          campos: [
            {
              id: 'nombreProducto',
              nombre: 'Nombre del Producto',
              tipo: 'texto',
              obligatorio: true,
              seccion: 'identificacion',
              placeholder: 'Ej: Galletas Integrales con Avena',
              ayuda: 'Nombre comercial exacto del producto'
            },
            {
              id: 'marca',
              nombre: 'Marca Comercial',
              tipo: 'texto',
              obligatorio: true,
              seccion: 'identificacion',
              placeholder: 'Ej: NutriVida'
            },
            {
              id: 'descripcion',
              nombre: 'Descripción del Producto',
              tipo: 'textarea',
              obligatorio: true,
              seccion: 'caracteristicas',
              placeholder: 'Describa detalladamente el producto...'
            },
            {
              id: 'ingredientes',
              nombre: 'Lista de Ingredientes',
              tipo: 'textarea',
              obligatorio: true,
              seccion: 'composicion',
              placeholder: 'Liste los ingredientes en orden decreciente de peso...'
            },
            {
              id: 'vidaUtil',
              nombre: 'Vida Útil (meses)',
              tipo: 'numero',
              obligatorio: true,
              seccion: 'conservacion'
            },
            {
              id: 'condicionesAlmacenamiento',
              nombre: 'Condiciones de Almacenamiento',
              tipo: 'textarea',
              obligatorio: true,
              seccion: 'conservacion',
              placeholder: 'Ej: Conservar en lugar fresco y seco...'
            },
            {
              id: 'presentaciones',
              nombre: 'Presentaciones Comerciales',
              tipo: 'textarea',
              obligatorio: true,
              seccion: 'comercializacion',
              placeholder: 'Ej: Empaque de 250g, 500g...'
            }
          ],
          secciones: [
            {
              id: 'identificacion',
              nombre: 'Identificación del Producto',
              descripcion: 'Información básica de identificación',
              orden: 1,
              expandible: false
            },
            {
              id: 'caracteristicas',
              nombre: 'Características del Producto',
              descripcion: 'Descripción detallada y propiedades',
              orden: 2,
              expandible: true
            },
            {
              id: 'composicion',
              nombre: 'Composición e Ingredientes',
              descripcion: 'Listado completo de ingredientes y aditivos',
              orden: 3,
              expandible: true
            },
            {
              id: 'conservacion',
              nombre: 'Conservación y Vida Útil',
              descripcion: 'Condiciones de almacenamiento y duración',
              orden: 4,
              expandible: true
            },
            {
              id: 'comercializacion',
              nombre: 'Información Comercial',
              descripcion: 'Presentaciones y aspectos comerciales',
              orden: 5,
              expandible: true
            }
          ],
          validaciones: [
            {
              campo: 'nombreProducto',
              tipo: 'requerido',
              valor: true,
              mensaje: 'El nombre del producto es obligatorio'
            },
            {
              campo: 'vidaUtil',
              tipo: 'minimo',
              valor: 1,
              mensaje: 'La vida útil debe ser mínimo 1 mes'
            }
          ]
        }
      },
      {
        idTipoDocumento: 2,
        codigo: 'INF-001',
        nombre: 'Información Nutricional',
        descripcion: 'Tabla nutricional completa del producto',
        categoria: 'TECNICO',
        obligatorio: true,
        aplicaA: ['GALLETAS', 'CEREALES', 'SNACKS', 'BEBIDAS'],
        version: '1.0',
        fechaVigencia: new Date('2024-12-31'),
        plantilla: {
          idPlantilla: 2,
          nombre: 'Plantilla Información Nutricional',
          version: '1.0',
          campos: [
            {
              id: 'porcionReferencia',
              nombre: 'Porción de Referencia (g)',
              tipo: 'numero',
              obligatorio: true,
              seccion: 'porcion',
              placeholder: 'Ej: 30'
            },
            {
              id: 'calorias',
              nombre: 'Calorías (kcal)',
              tipo: 'numero',
              obligatorio: true,
              seccion: 'macronutrientes'
            },
            {
              id: 'grasas',
              nombre: 'Grasas Totales (g)',
              tipo: 'numero',
              obligatorio: true,
              seccion: 'macronutrientes'
            },
            {
              id: 'carbohidratos',
              nombre: 'Carbohidratos (g)',
              tipo: 'numero',
              obligatorio: true,
              seccion: 'macronutrientes'
            },
            {
              id: 'proteinas',
              nombre: 'Proteínas (g)',
              tipo: 'numero',
              obligatorio: true,
              seccion: 'macronutrientes'
            },
            {
              id: 'fibra',
              nombre: 'Fibra Dietética (g)',
              tipo: 'numero',
              obligatorio: true,
              seccion: 'macronutrientes'
            },
            {
              id: 'sodio',
              nombre: 'Sodio (mg)',
              tipo: 'numero',
              obligatorio: true,
              seccion: 'micronutrientes'
            }
          ],
          secciones: [
            {
              id: 'porcion',
              nombre: 'Porción de Referencia',
              descripcion: 'Tamaño de porción para el análisis nutricional',
              orden: 1,
              expandible: false
            },
            {
              id: 'macronutrientes',
              nombre: 'Macronutrientes',
              descripcion: 'Contenido de calorías, grasas, carbohidratos y proteínas',
              orden: 2,
              expandible: false
            },
            {
              id: 'micronutrientes',
              nombre: 'Micronutrientes',
              descripcion: 'Vitaminas, minerales y otros componentes',
              orden: 3,
              expandible: true
            }
          ],
          validaciones: [
            {
              campo: 'porcionReferencia',
              tipo: 'minimo',
              valor: 1,
              mensaje: 'La porción de referencia debe ser mayor a 0'
            },
            {
              campo: 'calorias',
              tipo: 'minimo',
              valor: 0,
              mensaje: 'Las calorías no pueden ser negativas'
            }
          ]
        }
      },
      {
        idTipoDocumento: 3,
        codigo: 'CC-001',
        nombre: 'Certificado de Cámara de Comercio',
        descripcion: 'Certificado vigente de existencia y representación legal',
        categoria: 'LEGAL',
        obligatorio: true,
        aplicaA: ['TODOS'],
        version: '1.0',
        fechaVigencia: new Date('2024-12-31'),
        plantilla: {
          idPlantilla: 3,
          nombre: 'Verificación Cámara de Comercio',
          version: '1.0',
          campos: [
            {
              id: 'numeroCertificado',
              nombre: 'Número de Certificado',
              tipo: 'texto',
              obligatorio: true,
              seccion: 'identificacion'
            },
            {
              id: 'fechaExpedicion',
              nombre: 'Fecha de Expedición',
              tipo: 'fecha',
              obligatorio: true,
              seccion: 'identificacion'
            },
            {
              id: 'camaraComercio',
              nombre: 'Cámara de Comercio',
              tipo: 'texto',
              obligatorio: true,
              seccion: 'identificacion'
            },
            {
              id: 'archivo',
              nombre: 'Archivo del Certificado',
              tipo: 'archivo',
              obligatorio: true,
              seccion: 'archivo'
            }
          ],
          secciones: [
            {
              id: 'identificacion',
              nombre: 'Datos del Certificado',
              descripcion: 'Información básica del certificado',
              orden: 1,
              expandible: false
            },
            {
              id: 'archivo',
              nombre: 'Archivo',
              descripcion: 'Carga del documento digitalizado',
              orden: 2,
              expandible: false
            }
          ],
          validaciones: []
        }
      }
    ];

    this.documentosDisponiblesSubject.next(documentosMock);
  }

  // Métodos auxiliares
  filtrarDocumentosPorCategoria(categoria: string): TipoDocumentoInvimaDTO[] {
    const documentos = this.documentosDisponiblesSubject.value;
    if (categoria === 'TODOS') {
      return documentos;
    }
    return documentos.filter(doc => doc.categoria === categoria);
  }

  obtenerDocumentosObligatorios(): TipoDocumentoInvimaDTO[] {
    return this.documentosDisponiblesSubject.value.filter(doc => doc.obligatorio);
  }
}
