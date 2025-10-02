import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, firstValueFrom } from 'rxjs';
import { AuthService } from '../auth/services/auth.service';

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

  // 🆕 BÚSQUEDA AVANZADA - Endpoint principal unificado con fallback
  async searchEmails(filters: Partial<EmailSearchFilters> = {}): Promise<EmailPage> {
    console.log('🔍 EmailService.searchEmails() - Filtros:', filters);

    try {
      // Preparar el body de la búsqueda
      const searchBody: any = {
        page: filters.page || 0,
        size: filters.size || 15,
        sortBy: filters.sortBy || 'receivedDate',
        sortDirection: filters.sortDirection || 'DESC'
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
        // INTENTAR NUEVO ENDPOINT PRIMERO
        const response = this.http.post<EmailPage>(`${this.API_BASE_URL}/search`, searchBody, {
          headers: this.getAuthHeaders().set('Content-Type', 'application/json')
        });

        const result = await firstValueFrom(response);
        console.log('✅ Respuesta de búsqueda exitosa (NUEVO ENDPOINT):', result);
        return result;

      } catch (searchError: any) {
        console.warn('⚠️ Nuevo endpoint /search falló, intentando fallback...', searchError);

        // FALLBACK AL ENDPOINT ANTERIOR
        if (searchError.status === 404 || searchError.status === 0) {
          console.log('🔄 Usando endpoint /inbox como fallback...');

          // Usar el endpoint anterior que sabemos que funciona
          const fallbackFilters: Partial<EmailFilter> = {
            page: searchBody.page,
            size: searchBody.size,
            sortBy: searchBody.sortBy,
            sortDirection: searchBody.sortDirection,
            fromAddress: filters.fromAddress,
            subject: filters.subject,
            isRead: filters.isRead !== null ? filters.isRead : undefined, // Convertir null a undefined
            startDate: filters.startDate,
            endDate: filters.endDate,
            type: filters.type
          };

          return this.getInbox(fallbackFilters);
        } else {
          throw searchError;
        }
      }

    } catch (error: any) {
      console.error('❌ Error en EmailService.searchEmails():', error);
      console.error('🔍 Status:', error.status);
      console.error('🔍 Message:', error.message);
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
}
