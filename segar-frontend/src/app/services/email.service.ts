import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, firstValueFrom } from 'rxjs';
import { AuthService } from '../auth/services/auth.service';
import { environment } from '../../environments/environment';

export interface Email {
  id: number;
  fromAddress: string;
  toAddresses: string[];
  subject: string;
  content: string;
  isHtml: boolean;
  isRead: boolean;
  status: string;
  type: 'INBOUND' | 'OUTBOUND';
  sentDate: string;
  receivedDate: string;
  attachments: EmailAttachment[];
  attachmentCount: number;
}

export interface EmailAttachment {
  id: number;
  filename: string;
  contentType: string;
  size: number;
}

export interface EmailFilter {
  fromAddress?: string;
  subject?: string;
  type?: 'INBOUND' | 'OUTBOUND';
  status?: string;
  isRead?: boolean;
  startDate?: string;
  endDate?: string;
  page: number;
  size: number;
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC';
}

export interface EmailPage {
  content: Email[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface SendEmailRequest {
  toAddresses: string[];
  subject: string;
  content: string;
  isHtml: boolean;
  attachments: File[];
}

export interface EmailSearchFilters {
  searchText?: string;
  fromAddress?: string;
  subject?: string;
  isRead?: boolean | null;
  startDate?: string;
  endDate?: string;
  type?: 'INBOUND' | 'OUTBOUND';
  hasAttachments?: boolean | null;
  page: number;
  size: number;
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC';
}

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  private readonly API_BASE_URL = 'http://localhost:8090/api/notifications/emails';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();

    if (!token) {
      console.error('❌ No hay token de autenticación disponible');
      throw new Error('Token de autenticación no encontrado');
    }

    console.log('🔑 Token encontrado, longitud:', token.length);
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // Método para manejar errores de autenticación
  private handleAuthError(error: any): never {
    console.error('🔐 Error de autenticación detectado:', error);

    if (error.status === 401) {
      console.log('🔄 Token expirado, limpiando storage...');
      localStorage.removeItem('access_token');
      sessionStorage.removeItem('access_token');

      // Redirigir al login
      window.location.href = '/auth/login';
    }

    throw error;
  }

  // Obtener bandeja de entrada con sincronización automática
  async getInbox(filters: Partial<EmailFilter> = {}): Promise<EmailPage> {
    console.log('📡 EmailService.getInbox() - Filtros:', filters);

    try {
      // Verificar si solo son parámetros de paginación básica
      const onlyPaginationParams = Object.keys(filters).every(key =>
        ['page', 'size', 'sortBy', 'sortDirection'].includes(key)
      );

      if (Object.keys(filters).length === 0 || onlyPaginationParams) {
        // GET request para obtener todos los correos
        const params = new HttpParams()
          .set('page', filters.page?.toString() || '0')
          .set('size', filters.size?.toString() || '10');

        console.log('📡 Haciendo GET request a:', `${this.API_BASE_URL}/inbox`);
        console.log('📡 Parámetros:', params.toString());

        const response = this.http.get<EmailPage>(`${this.API_BASE_URL}/inbox`, {
          headers: this.getAuthHeaders(),
          params
        });

        const result = await firstValueFrom(response);
        console.log('✅ Respuesta GET exitosa:', result);
        return result;
      } else {
        // POST request para filtrado avanzado
        console.log('📡 Haciendo POST request a:', `${this.API_BASE_URL}/inbox`);
        console.log('📡 Body:', filters);

        const response = this.http.post<EmailPage>(`${this.API_BASE_URL}/inbox`, filters, {
          headers: this.getAuthHeaders()
        });

        const result = await firstValueFrom(response);
        console.log('✅ Respuesta POST exitosa:', result);
        return result;
      }
    } catch (error: any) {
      console.error('❌ Error en EmailService.getInbox():', error);

      if (error.status === 401) {
        return this.handleAuthError(error);
      }

      // Re-lanzar el error para que el componente lo pueda manejar
      throw error;
    }
  }

  // Obtener solo correos recibidos
  async getReceivedEmails(filters: Partial<EmailFilter> = {}): Promise<EmailPage> {
    const params = new HttpParams()
      .set('page', filters.page?.toString() || '0')
      .set('size', filters.size?.toString() || '10');

    const response = this.http.get<EmailPage>(`${this.API_BASE_URL}/inbox/received`, {
      headers: this.getAuthHeaders(),
      params
    });

    return firstValueFrom(response);
  }

  // Obtener correos enviados
  async getSentEmails(filters: Partial<EmailFilter> = {}): Promise<EmailPage> {
    const params = new HttpParams()
      .set('page', filters.page?.toString() || '0')
      .set('size', filters.size?.toString() || '10');

    const response = this.http.get<EmailPage>(`${this.API_BASE_URL}/sent`, {
      headers: this.getAuthHeaders(),
      params
    });

    return firstValueFrom(response);
  }

  // Enviar correo
  async sendEmail(emailData: SendEmailRequest): Promise<void> {
    const formData = new FormData();

    // Agregar datos del correo
    formData.append('toAddresses', JSON.stringify(emailData.toAddresses));
    formData.append('subject', emailData.subject);
    formData.append('content', emailData.content);
    formData.append('isHtml', emailData.isHtml.toString());

    // Agregar adjuntos
    emailData.attachments.forEach((file, index) => {
      formData.append('attachments', file);
    });

    const response = this.http.post(`${this.API_BASE_URL}/send`, formData, {
      headers: this.getAuthHeaders().delete('Content-Type') // Permitir que el browser establezca el Content-Type para multipart
    });

    await firstValueFrom(response);
  }

  // Marcar como leído
  async markAsRead(emailId: number): Promise<void> {
    const response = this.http.put(`${this.API_BASE_URL}/${emailId}/mark-read`, null, {
      headers: this.getAuthHeaders()
    });

    await firstValueFrom(response);
  }

  // Marcar como no leído
  async markAsUnread(emailId: number): Promise<void> {
    const response = this.http.put(`${this.API_BASE_URL}/${emailId}/mark-unread`, null, {
      headers: this.getAuthHeaders()
    });

    await firstValueFrom(response);
  }

  // 🆕 BÚSQUEDA AVANZADA - Endpoint principal unificado con fallback mejorado
  async searchEmails(filters: Partial<EmailSearchFilters> = {}): Promise<EmailPage> {
    console.log('🔍 EmailService.searchEmails() - Filtros:', filters);

    try {
      // Preparar parámetros comunes
      const page = filters.page || 0;
      const size = filters.size || 15;
      const sortBy = filters.sortBy || 'receivedDate';
      const sortDirection = filters.sortDirection || 'DESC';

      // ESTRATEGIA 1: Intentar con GET /inbox primero (más compatible)
      console.log('📡 Intentando GET /inbox con parámetros...');

      let params = new HttpParams()
        .set('page', page.toString())
        .set('size', size.toString())
        .set('sortBy', sortBy)
        .set('sortDirection', sortDirection);

      // Agregar filtros opcionales como query params
      if (filters.searchText?.trim()) {
        params = params.set('searchText', filters.searchText.trim());
      }
      if (filters.fromAddress?.trim()) {
        params = params.set('fromAddress', filters.fromAddress.trim());
      }
      if (filters.subject?.trim()) {
        params = params.set('subject', filters.subject.trim());
      }
      if (filters.isRead !== null && filters.isRead !== undefined) {
        params = params.set('isRead', filters.isRead.toString());
      }
      if (filters.startDate?.trim()) {
        params = params.set('startDate', filters.startDate);
      }
      if (filters.endDate?.trim()) {
        params = params.set('endDate', filters.endDate);
      }
      if (filters.type) {
        params = params.set('type', filters.type);
      }
      if (filters.hasAttachments !== null && filters.hasAttachments !== undefined) {
        params = params.set('hasAttachments', filters.hasAttachments.toString());
      }

      try {
        const response = this.http.get<EmailPage>(`${this.API_BASE_URL}/inbox`, {
          headers: this.getAuthHeaders(),
          params
        });

        const result = await firstValueFrom(response);
        console.log('✅ Respuesta GET /inbox exitosa:', result);
        return result;

      } catch (getError: any) {
        console.warn('⚠️ GET /inbox falló, intentando POST /search...', getError);

        // ESTRATEGIA 2: Intentar con POST /search (nuevo endpoint)
        if (getError.status !== 405) { // Si no es método no permitido, intentar POST
          const searchBody: any = {
            page,
            size,
            sortBy,
            sortDirection
          };

          // Agregar filtros solo si tienen valores válidos
          if (filters.searchText?.trim()) {
            searchBody.searchText = filters.searchText.trim();
          }
          if (filters.fromAddress?.trim()) {
            searchBody.fromAddress = filters.fromAddress.trim();
          }
          if (filters.subject?.trim()) {
            searchBody.subject = filters.subject.trim();
          }
          if (filters.isRead !== null && filters.isRead !== undefined) {
            searchBody.isRead = filters.isRead;
          }
          if (filters.startDate?.trim()) {
            searchBody.startDate = filters.startDate;
          }
          if (filters.endDate?.trim()) {
            searchBody.endDate = filters.endDate;
          }
          if (filters.type) {
            searchBody.type = filters.type;
          }
          if (filters.hasAttachments !== null && filters.hasAttachments !== undefined) {
            searchBody.hasAttachments = filters.hasAttachments;
          }

          console.log('📡 Haciendo POST request a:', `${this.API_BASE_URL}/search`);
          console.log('📡 Body:', searchBody);

          try {
            const postResponse = this.http.post<EmailPage>(`${this.API_BASE_URL}/search`, searchBody, {
              headers: this.getAuthHeaders().set('Content-Type', 'application/json')
            });

            const postResult = await firstValueFrom(postResponse);
            console.log('✅ Respuesta POST /search exitosa:', postResult);
            return postResult;

          } catch (postError: any) {
            console.error('❌ POST /search también falló:', postError);
            throw postError;
          }
        } else {
          // Si es 405 en GET, no tiene sentido intentar POST
          throw getError;
        }
      }

    } catch (error: any) {
      console.error('❌ Error en EmailService.searchEmails():', error);
      console.error('🔍 Status:', error.status);
      console.error('🔍 Message:', error.message);

      // Si todo falla, intentar el método más básico
      if (error.status === 405 || error.status === 404) {
        console.log('🔄 Usando método básico de fallback...');
        try {
          return await this.getInbox({
            page: filters.page || 0,
            size: filters.size || 15
          });
        } catch (fallbackError) {
          console.error('❌ Fallback también falló:', fallbackError);
          throw error; // Lanzar el error original
        }
      }

      throw error;
    }
  }

  // Obtener conteo de correos no leídos
  async getUnreadCount(): Promise<number> {
    console.log('📡 EmailService.getUnreadCount()');

    try {
      const response = this.http.get<number>(`${this.API_BASE_URL}/unread-count`, {
        headers: this.getAuthHeaders()
      });

      const result = await firstValueFrom(response);
      console.log('✅ Conteo de no leídos:', result);
      return result;
    } catch (error: any) {
      console.error('❌ Error obteniendo conteo de no leídos:', error);
      throw error;
    }
  }

  // Eliminar correo
  async deleteEmail(emailId: number): Promise<void> {
    const response = this.http.delete(`${this.API_BASE_URL}/${emailId}`, {
      headers: this.getAuthHeaders()
    });

    await firstValueFrom(response);
  }

  // Descargar adjunto
  getAttachmentDownloadUrl(emailId: number, attachmentId: number): string {
    return `${this.API_BASE_URL}/${emailId}/attachments/${attachmentId}/download`;
  }

  // Métodos de conveniencia para casos de uso específicos

  // 🔍 Búsqueda general en la barra de búsqueda
  async searchInEmails(searchText: string, page: number = 0, size: number = 10): Promise<EmailPage> {
    return this.searchEmails({
      searchText: searchText,
      page: page,
      size: size
    });
  }

  // 👤 Filtrar por remitente específico
  async filterByFrom(fromEmail: string, page: number = 0, size: number = 15): Promise<EmailPage> {
    return this.searchEmails({
      fromAddress: fromEmail,
      page: page,
      size: size
    });
  }

  // 📖 Mostrar solo correos no leídos
  async getUnreadEmails(page: number = 0, size: number = 20): Promise<EmailPage> {
    return this.searchEmails({
      isRead: false,
      page: page,
      size: size
    });
  }

  // 📅 Filtrar por rango de fechas
  async filterByDateRange(startDate: string, endDate: string, page: number = 0, size: number = 25): Promise<EmailPage> {
    return this.searchEmails({
      startDate: startDate,
      endDate: endDate,
      page: page,
      size: size
    });
  }

  // 📎 Mostrar solo correos con adjuntos
  async getEmailsWithAttachments(page: number = 0, size: number = 10): Promise<EmailPage> {
    return this.searchEmails({
      hasAttachments: true,
      page: page,
      size: size
    });
  }

  // 🔍 Búsqueda combinada inteligente
  async findUnreadInvoices(page: number = 0, size: number = 15): Promise<EmailPage> {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    return this.searchEmails({
      searchText: "factura OR invoice OR pago",
      isRead: false,
      hasAttachments: true,
      startDate: startOfMonth.toISOString(),
      page: page,
      size: size,
      sortBy: "receivedDate",
      sortDirection: "DESC"
    });
  }

  /**
   * Envía solicitud formal de trámite al INVIMA
   * @param datosTramite Todos los datos necesarios para la carta formal
   */
  async enviarSolicitudFormalInvima(datosTramite: {
    numeroRadicado: string;
    tipoTramite: string;
    empresa: {
      razonSocial: string;
      nit: string;
      direccion: string;
      ciudad: string;
      telefono: string;
      email: string;
    };
    representanteLegal: {
      nombre: string;
      cedula: string;
    };
    producto: {
      nombre: string;
      marca: string;
      categoria: string;
      presentacion: string;
    };
    fabricacion: {
      nombrePlanta: string;
      direccionPlanta: string;
      ciudadPlanta: string;
      departamentoPlanta: string;
    };
    documentosAdjuntos: string[];
    alcanceComercializacion: string;
  }): Promise<void> {
    console.log('📧 Enviando solicitud formal al INVIMA...');
    console.log('   Empresa:', datosTramite.empresa.razonSocial);
    console.log('   Producto:', datosTramite.producto.nombre);
    console.log('   Radicado:', datosTramite.numeroRadicado);
    console.log('   Tipo:', datosTramite.tipoTramite);

    const destinatario = 'juando02603spam@gmail.com';

    // Determinar el tipo de trámite para el asunto
    let tipoTramiteCorto = 'Registro Sanitario';
    if (datosTramite.tipoTramite.toLowerCase().includes('renovación') ||
        datosTramite.tipoTramite.toLowerCase().includes('renovacion')) {
      tipoTramiteCorto = 'Renovación de Registro Sanitario';
    } else if (datosTramite.tipoTramite.toLowerCase().includes('modificación') ||
               datosTramite.tipoTramite.toLowerCase().includes('modificacion')) {
      tipoTramiteCorto = 'Modificación de Registro Sanitario';
    }

    const asunto = `Solicitud de ${tipoTramiteCorto} - ${datosTramite.producto.nombre}`;

    // Generar fecha en formato colombiano
    const fechaActual = new Date().toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const contenidoHtml = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 900px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
          }
          .carta {
            border: 3px solid #0066cc;
            border-radius: 8px;
            padding: 40px;
            background-color: #ffffff;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
          }
          .encabezado {
            text-align: right;
            margin-bottom: 30px;
            font-size: 14px;
            border-bottom: 2px solid #0066cc;
            padding-bottom: 15px;
          }
          .destinatario {
            margin-bottom: 30px;
            font-size: 14px;
            background-color: #f0f7ff;
            padding: 15px;
            border-left: 4px solid #0066cc;
          }
          .asunto {
            margin: 30px 0;
            font-weight: bold;
            font-size: 16px;
            color: #0066cc;
            text-decoration: underline;
          }
          .cuerpo {
            text-align: justify;
            font-size: 14px;
            margin-bottom: 30px;
            line-height: 1.8;
          }
          .cuerpo p {
            margin-bottom: 15px;
          }
          .seccion-titulo {
            font-weight: bold;
            margin-top: 25px;
            margin-bottom: 15px;
            font-size: 15px;
            color: #0066cc;
            background-color: #e6f2ff;
            padding: 10px;
            border-left: 5px solid #0066cc;
          }
          .lista-documentos {
            margin-left: 0;
            margin-bottom: 25px;
            padding: 20px;
            background-color: #f9f9f9;
            border: 1px solid #ddd;
            border-radius: 4px;
          }
          .lista-documentos li {
            margin-bottom: 8px;
            padding-left: 10px;
            color: #555;
          }
          .firma {
            margin-top: 60px;
            text-align: center;
          }
          .firma-linea {
            border-top: 3px solid #0066cc;
            width: 350px;
            margin: 50px auto 15px auto;
          }
          .firma-nombre {
            font-weight: bold;
            margin-bottom: 5px;
            font-size: 16px;
            color: #000;
          }
          .firma-cargo {
            font-style: italic;
            color: #666;
            font-size: 14px;
          }
          .datos-empresa {
            margin: 10px 0;
            line-height: 1.8;
          }
          .dato-label {
            font-weight: bold;
            color: #0066cc;
          }
          .numero-radicado {
            text-align: right;
            font-weight: bold;
            font-size: 18px;
            margin-bottom: 25px;
            color: #fff;
            background-color: #0066cc;
            padding: 12px 20px;
            border-radius: 4px;
          }
          .declaracion {
            background-color: #fff8e1;
            border-left: 4px solid #ff9800;
            padding: 15px;
            margin: 25px 0;
            font-style: italic;
          }
          strong {
            color: #0066cc;
          }
          .tabla-info {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
          }
          .tabla-info td {
            padding: 10px;
            border-bottom: 1px solid #e0e0e0;
          }
          .tabla-info td:first-child {
            font-weight: bold;
            color: #0066cc;
            width: 200px;
          }
        </style>
      </head>
      <body>
        <div class="carta">
          <div class="numero-radicado">
            📋 Radicado No. ${datosTramite.numeroRadicado}
          </div>

          <div class="encabezado">
            ${datosTramite.empresa.ciudad}, ${fechaActual}
          </div>

          <div class="destinatario">
            <strong>A la atención del Departamento de Trámites Sanitarios</strong><br>
            <strong>INVIMA</strong><br>
            Calle 26 No. 51-20<br>
            Bogotá D.C., Colombia
          </div>

          <div class="asunto">
            <strong>Asunto:</strong> Solicitud de ${tipoTramiteCorto} de Alimentos Procesados
          </div>

          <div class="cuerpo">
            <p>
              Por medio de la presente, la empresa <strong>${datosTramite.empresa.razonSocial}</strong>,
              identificada con NIT <strong>${datosTramite.empresa.nit}</strong>, se permite presentar ante
              ustedes la solicitud de ${tipoTramiteCorto.toLowerCase()} correspondiente al producto:
            </p>

            <p style="text-align: center; margin: 25px 0; font-size: 18px; background-color: #e6f2ff; padding: 15px; border-radius: 4px;">
              <strong>"${datosTramite.producto.nombre}"</strong><br>
              <span style="font-size: 16px; color: #666;">Marca: ${datosTramite.producto.marca}</span>
            </p>

            <div class="seccion-titulo">📋 Información de la Empresa Solicitante</div>
            <table class="tabla-info">
              <tr>
                <td><span class="dato-label">Razón Social:</span></td>
                <td>${datosTramite.empresa.razonSocial}</td>
              </tr>
              <tr>
                <td><span class="dato-label">NIT:</span></td>
                <td>${datosTramite.empresa.nit}</td>
              </tr>
              <tr>
                <td><span class="dato-label">Dirección:</span></td>
                <td>${datosTramite.empresa.direccion}</td>
              </tr>
              <tr>
                <td><span class="dato-label">Ciudad:</span></td>
                <td>${datosTramite.empresa.ciudad}</td>
              </tr>
              <tr>
                <td><span class="dato-label">Teléfono:</span></td>
                <td>${datosTramite.empresa.telefono}</td>
              </tr>
              <tr>
                <td><span class="dato-label">Correo Electrónico:</span></td>
                <td>${datosTramite.empresa.email}</td>
              </tr>
            </table>

            <div class="seccion-titulo">👤 Representante Legal</div>
            <table class="tabla-info">
              <tr>
                <td><span class="dato-label">Nombre:</span></td>
                <td>${datosTramite.representanteLegal.nombre}</td>
              </tr>
              <tr>
                <td><span class="dato-label">Cédula de Ciudadanía:</span></td>
                <td>${datosTramite.representanteLegal.cedula}</td>
              </tr>
            </table>

            <div class="seccion-titulo">🏭 Información del Producto y Fabricación</div>
            <table class="tabla-info">
              <tr>
                <td><span class="dato-label">Producto:</span></td>
                <td><strong>${datosTramite.producto.nombre}</strong></td>
              </tr>
              <tr>
                <td><span class="dato-label">Marca:</span></td>
                <td>${datosTramite.producto.marca}</td>
              </tr>
              <tr>
                <td><span class="dato-label">Categoría:</span></td>
                <td>${datosTramite.producto.categoria}</td>
              </tr>
              <tr>
                <td><span class="dato-label">Presentación:</span></td>
                <td>${datosTramite.producto.presentacion}</td>
              </tr>
              <tr>
                <td><span class="dato-label">Planta de Producción:</span></td>
                <td>${datosTramite.fabricacion.nombrePlanta}</td>
              </tr>
              <tr>
                <td><span class="dato-label">Dirección de la Planta:</span></td>
                <td>${datosTramite.fabricacion.direccionPlanta}</td>
              </tr>
              <tr>
                <td><span class="dato-label">Ubicación:</span></td>
                <td>${datosTramite.fabricacion.ciudadPlanta}, ${datosTramite.fabricacion.departamentoPlanta}</td>
              </tr>
              <tr>
                <td><span class="dato-label">Alcance de Comercialización:</span></td>
                <td><strong>${datosTramite.alcanceComercializacion}</strong></td>
              </tr>
            </table>

            <div class="seccion-titulo">📎 Documentos Anexos</div>
            <ul class="lista-documentos">
              ${datosTramite.documentosAdjuntos.map((doc, index) => `<li><strong>${index + 1}.</strong> ${doc}</li>`).join('')}
            </ul>

            <div class="declaracion">
              <strong>⚖️ Declaración de Veracidad:</strong> Declaramos que los datos consignados en esta solicitud
              y los documentos anexos son veraces y nos comprometemos a cumplir con la normativa sanitaria aplicable,
              así como a permitir la inspección y verificación de nuestras instalaciones si así lo requiere el INVIMA.
            </div>

            <p>
              Quedamos atentos a cualquier requerimiento adicional que se nos formule y agradecemos de
              antemano la atención prestada.
            </p>

            <p style="margin-top: 30px;">
              <strong>Atentamente,</strong>
            </p>
          </div>

          <div class="firma">
            <div class="firma-linea"></div>
            <div class="firma-nombre">${datosTramite.representanteLegal.nombre}</div>
            <div class="firma-cargo">Representante Legal</div>
            <div class="firma-cargo">${datosTramite.empresa.razonSocial}</div>
            <div class="datos-empresa" style="margin-top: 20px; font-size: 12px;">
              ${datosTramite.empresa.direccion}<br>
              ${datosTramite.empresa.ciudad}<br>
              Tel: ${datosTramite.empresa.telefono}<br>
              Email: ${datosTramite.empresa.email}
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      // Crear el request para enviar el correo
      const emailRequest = {
        toAddresses: [destinatario],
        subject: asunto,
        content: contenidoHtml,
        isHtml: true
      };

      const headers = this.getAuthHeaders();

      console.log('');
      console.log('========================================');
      console.log('📧 ENVIANDO CORREO FORMAL AL INVIMA');
      console.log('========================================');
      console.log('');
      console.log('📤 DESTINATARIO:', destinatario);
      console.log('📋 ASUNTO:', asunto);
      console.log('📋 RADICADO:', datosTramite.numeroRadicado);
      console.log('🏢 EMPRESA:', datosTramite.empresa.razonSocial);
      console.log('📦 PRODUCTO:', datosTramite.producto.nombre);
      console.log('🏷️  MARCA:', datosTramite.producto.marca);
      console.log('📑 TIPO TRÁMITE:', datosTramite.tipoTramite);
      console.log('');
      console.log('📎 DOCUMENTOS ANEXOS:');
      datosTramite.documentosAdjuntos.forEach((doc, index) => {
        console.log(`   ${index + 1}. ${doc}`);
      });
      console.log('');
      console.log('🌐 URL DEL BACKEND:', `${environment.apiUrl}/api/notifications/emails/send`);
      console.log('');
      console.log('📧 PAYLOAD COMPLETO:');
      console.log(JSON.stringify(emailRequest, null, 2));
      console.log('');
      console.log('⏳ Enviando solicitud al servidor...');
      console.log('');

      // Usar el endpoint correcto del backend
      const response = await firstValueFrom(
        this.http.post(`${environment.apiUrl}/api/notifications/emails/send`, emailRequest, { headers })
      );

      console.log('');
      console.log('========================================');
      console.log('✅ CORREO ENVIADO EXITOSAMENTE');
      console.log('========================================');
      console.log('');
      console.log('📧 RESPUESTA DEL SERVIDOR:');
      console.log(JSON.stringify(response, null, 2));
      console.log('');
      console.log('✅ El correo formal fue enviado a:', destinatario);
      console.log('✅ Radicado:', datosTramite.numeroRadicado);
      console.log('');

    } catch (error: any) {
      console.log('');
      console.log('========================================');
      console.error('❌ ERROR AL ENVIAR CORREO');
      console.log('========================================');
      console.log('');
      console.error('❌ Destinatario:', destinatario);
      console.error('❌ Asunto:', asunto);
      console.error('❌ Error completo:', error);
      console.error('❌ Mensaje:', error.message);
      console.error('❌ Status:', error.status);
      console.error('❌ Error del servidor:', error.error);
      console.log('');

      // No lanzar error para no interrumpir el flujo de radicación
      // El correo es secundario, la radicación es lo principal
    }
  }
}
