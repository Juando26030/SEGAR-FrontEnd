import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { EmailService, Email, EmailFilter, EmailSearchFilters } from '../../services/email.service';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-correos',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './correos.component.html',
  styleUrls: ['./correos.component.css']
})
export class CorreosComponent implements OnInit, OnDestroy {
  emails: Email[] = [];
  filteredEmails: Email[] = [];
  selectedEmail: Email | null = null;
  loading = false;
  unreadCount = 0;

  // 🎬 Animación de carga
  loadingProgress = 0;
  loadingMessage = 'Sincronizando sus correos...';
  private progressInterval: any;

  // Filtros avanzados
  searchFilters: EmailSearchFilters = {
    searchText: '',
    fromAddress: '',
    subject: '',
    isRead: null,
    startDate: '',
    endDate: '',
    type: undefined,
    hasAttachments: null,
    page: 0,
    size: 15,
    sortBy: 'receivedDate',
    sortDirection: 'DESC'
  };

  // UI States
  selectedTab: 'inbox' | 'sent' | 'compose' = 'inbox';
  showAdvancedFilters = false;
  quickFilters = {
    unreadOnly: false,
    withAttachmentsOnly: false,
    todayOnly: false
  };

  // Paginación
  currentPage = 0;
  pageSize = 15;
  totalPages = 0;
  totalElements = 0;

  // Compose form
  composeForm = {
    toAddresses: [''],
    subject: '',
    content: '',
    isHtml: false,
    attachments: [] as File[]
  };

  private subscription = new Subscription();

  constructor(private emailService: EmailService) {}

  ngOnInit() {
    this.performSearch(); // Usar búsqueda avanzada
    this.loadUnreadCount();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.clearProgressAnimation();
  }

  // 🎬 Métodos para la animación de progreso
  private startProgressAnimation() {
    this.loadingProgress = 0;
    this.clearProgressAnimation();

    const messages = [
      'Sincronizando sus correos...',
      'Conectando con el servidor...',
      'Recuperando mensajes...',
      'Cargando correos...',
      'Casi listo...'
    ];

    let messageIndex = 0;

    this.progressInterval = setInterval(() => {
      if (this.loadingProgress < 90) {
        // Progreso más rápido al inicio, más lento al final
        const increment = this.loadingProgress < 50 ? 8 : this.loadingProgress < 70 ? 4 : 2;
        this.loadingProgress = Math.min(90, this.loadingProgress + increment);

        // Cambiar mensaje cada 25%
        const newMessageIndex = Math.floor(this.loadingProgress / 20);
        if (newMessageIndex !== messageIndex && newMessageIndex < messages.length) {
          messageIndex = newMessageIndex;
          this.loadingMessage = messages[messageIndex];
        }
      }
    }, 150);
  }

  private completeProgressAnimation() {
    this.loadingProgress = 100;
    this.loadingMessage = '¡Correos cargados!';

    // Limpiar después de un pequeño delay para mostrar el 100%
    setTimeout(() => {
      this.clearProgressAnimation();
    }, 300);
  }

  private clearProgressAnimation() {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = null;
    }
  }

  // 🆕 MÉTODO PRINCIPAL DE BÚSQUEDA AVANZADA
  async performSearch() {
    this.loading = true;
    this.startProgressAnimation();
    this.addTestLog('🔍 Iniciando performSearch()');
    console.log('🔍 Realizando búsqueda con filtros:', this.searchFilters);

    try {
      // Actualizar paginación en filtros
      this.searchFilters.page = this.currentPage;
      this.searchFilters.size = this.pageSize;

      this.addTestLog(`📡 Llamando searchEmails con: page=${this.currentPage}, size=${this.pageSize}`);
      const response = await this.emailService.searchEmails(this.searchFilters);

      this.addTestLog(`✅ Respuesta recibida - Total: ${response.totalElements}, Esta página: ${response.content?.length || 0}`);
      console.log('✅ Respuesta de búsqueda:', response);
      console.log('📧 Correos encontrados:', response.content);
      console.log('📊 Total elementos:', response.totalElements);

      this.emails = response.content || [];
      this.filteredEmails = this.emails;
      this.totalPages = response.totalPages || 0;
      this.totalElements = response.totalElements || 0;

      if (this.emails.length === 0) {
        this.addTestLog('⚠️ Array de correos vacío después de la respuesta');
        console.log('⚠️ No se encontraron correos con los filtros aplicados');
      } else {
        this.addTestLog(`✅ ${this.emails.length} correos cargados exitosamente`);
        this.emails.forEach((email, index) => {
          if (index < 3) { // Solo los primeros 3 para no spam
            this.addTestLog(`📧 ${index + 1}: ${email.subject || '(Sin asunto)'} - ${email.fromAddress}`);
          }
        });
      }

      this.completeProgressAnimation();

    } catch (error: any) {
      this.lastError = error;
      this.addTestLog(`❌ Error en performSearch: ${error.message} (${error.status})`);
      console.error('❌ Error en búsqueda:', error);
      console.error('🔍 Detalles del error:', {
        message: error?.message,
        status: error?.status,
        statusText: error?.statusText,
        url: error?.url
      });

      this.clearProgressAnimation();
      alert(`Error al buscar correos: ${error?.message || 'Error desconocido'}`);
    } finally {
      this.loading = false;
      this.addTestLog(`🏁 performSearch terminado - Loading: ${this.loading}`);
    }
  }

  // 🔍 Búsqueda por texto general
  async onSearchTextChange() {
    console.log('🔍 Texto de búsqueda cambiado:', this.searchFilters.searchText);
    this.currentPage = 0;
    this.searchFilters.page = 0;
    await this.performSearch();
  }

  // 🧹 Limpiar búsqueda
  async clearSearch() {
    this.searchFilters.searchText = '';
    this.currentPage = 0;
    this.searchFilters.page = 0;
    await this.performSearch();
  }

  // ⚡ FILTROS RÁPIDOS
  async toggleUnreadFilter() {
    this.quickFilters.unreadOnly = !this.quickFilters.unreadOnly;
    this.searchFilters.isRead = this.quickFilters.unreadOnly ? false : null;
    this.currentPage = 0;
    this.searchFilters.page = 0;
    await this.performSearch();
  }

  async toggleAttachmentsFilter() {
    this.quickFilters.withAttachmentsOnly = !this.quickFilters.withAttachmentsOnly;
    this.searchFilters.hasAttachments = this.quickFilters.withAttachmentsOnly ? true : null;
    this.currentPage = 0;
    this.searchFilters.page = 0;
    await this.performSearch();
  }

  async toggleTodayFilter() {
    this.quickFilters.todayOnly = !this.quickFilters.todayOnly;

    if (this.quickFilters.todayOnly) {
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

      this.searchFilters.startDate = startOfDay.toISOString();
      this.searchFilters.endDate = endOfDay.toISOString();
    } else {
      this.searchFilters.startDate = '';
      this.searchFilters.endDate = '';
    }

    this.currentPage = 0;
    this.searchFilters.page = 0;
    await this.performSearch();
  }

  // 🔧 FILTROS AVANZADOS
  toggleAdvancedFilters() {
    this.showAdvancedFilters = !this.showAdvancedFilters;
  }

  async applyAdvancedFilters() {
    console.log('🔧 Aplicando filtros avanzados:', this.searchFilters);
    this.currentPage = 0;
    this.searchFilters.page = 0;
    await this.performSearch();
    this.showAdvancedFilters = false;
  }

  async clearAllFilters() {
    // Resetear todos los filtros
    this.searchFilters = {
      searchText: '',
      fromAddress: '',
      subject: '',
      isRead: null,
      startDate: '',
      endDate: '',
      type: undefined,
      hasAttachments: null,
      page: 0,
      size: 15,
      sortBy: 'receivedDate',
      sortDirection: 'DESC'
    };

    this.quickFilters = {
      unreadOnly: false,
      withAttachmentsOnly: false,
      todayOnly: false
    };

    this.currentPage = 0;
    await this.performSearch();
  }

  // 📄 PAGINACIÓN
  async goToPage(page: number) {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.searchFilters.page = page;
      await this.performSearch();
    }
  }

  async previousPage() {
    if (this.currentPage > 0) {
      await this.goToPage(this.currentPage - 1);
    }
  }

  async nextPage() {
    if (this.currentPage < this.totalPages - 1) {
      await this.goToPage(this.currentPage + 1);
    }
  }

  // 📧 MANEJO DE CORREOS
  selectEmail(email: Email) {
    this.selectedEmail = email;
    if (!email.isRead) {
      this.markAsRead(email.id);
    }
  }

  async markAsRead(emailId: number) {
    try {
      await this.emailService.markAsRead(emailId);
      const email = this.emails.find(e => e.id === emailId);
      if (email) {
        email.isRead = true;
        this.unreadCount = Math.max(0, this.unreadCount - 1);
      }
    } catch (error) {
      console.error('Error marking email as read:', error);
    }
  }

  async markAsUnread(emailId: number) {
    try {
      await this.emailService.markAsUnread(emailId);
      const email = this.emails.find(e => e.id === emailId);
      if (email) {
        email.isRead = false;
        this.unreadCount++;
      }
    } catch (error) {
      console.error('Error marking email as unread:', error);
    }
  }

  async deleteEmail(emailId: number) {
    if (confirm('¿Estás seguro de que quieres eliminar este correo?')) {
      try {
        await this.emailService.deleteEmail(emailId);
        this.emails = this.emails.filter(e => e.id !== emailId);
        this.filteredEmails = this.filteredEmails.filter(e => e.id !== emailId);
        if (this.selectedEmail?.id === emailId) {
          this.selectedEmail = null;
        }
        this.totalElements = Math.max(0, this.totalElements - 1);
      } catch (error) {
        console.error('Error deleting email:', error);
        alert('Error al eliminar el correo');
      }
    }
  }

  // 📎 MANEJO DE ADJUNTOS
  downloadAttachment(emailId: number, attachmentId: number, filename: string) {
    const url = this.emailService.getAttachmentDownloadUrl(emailId, attachmentId);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // 🗂️ MANEJO DE PESTAÑAS
  async setTab(tab: 'inbox' | 'sent' | 'compose') {
    this.selectedTab = tab;
    this.selectedEmail = null;

    if (tab === 'inbox') {
      // Resetear filtros y cargar bandeja de entrada
      this.searchFilters.type = undefined;
      this.currentPage = 0;
      await this.performSearch();
    } else if (tab === 'sent') {
      // Cargar correos enviados usando el endpoint específico /sent
      this.loading = true;
      this.startProgressAnimation();
      try {
        const response = await this.emailService.getSentEmails({
          page: this.currentPage,
          size: this.pageSize,
          sortBy: 'sentDate',
          sortDirection: 'DESC'
        });

        this.emails = response.content || [];
        this.filteredEmails = this.emails;
        this.totalPages = response.totalPages || 0;
        this.totalElements = response.totalElements || 0;

        console.log('✅ Correos enviados cargados:', this.emails.length);
        this.completeProgressAnimation();
      } catch (error) {
        console.error('❌ Error cargando correos enviados:', error);
        this.clearProgressAnimation();
        alert('Error al cargar correos enviados');
      } finally {
        this.loading = false;
      }
    } else if (tab === 'compose') {
      // Resetear formulario de composición
      this.composeForm = {
        toAddresses: [''],
        subject: '',
        content: '',
        isHtml: false,
        attachments: []
      };
    }
  }

  // ✉️ COMPOSICIÓN DE CORREOS
  addRecipient() {
    this.composeForm.toAddresses.push('');
  }

  removeRecipient(index: number) {
    if (this.composeForm.toAddresses.length > 1) {
      this.composeForm.toAddresses.splice(index, 1);
    }
  }

  onFileSelected(event: any) {
    const files = event.target.files;
    for (let i = 0; i < files.length; i++) {
      this.composeForm.attachments.push(files[i]);
    }
  }

  removeAttachment(index: number) {
    this.composeForm.attachments.splice(index, 1);
  }

  async sendEmail() {
    try {
      // Validar campos requeridos
      if (!this.composeForm.toAddresses.some(addr => addr.trim())) {
        alert('Debe especificar al menos un destinatario');
        return;
      }

      if (!this.composeForm.subject.trim()) {
        alert('El asunto es requerido');
        return;
      }

      // Filtrar direcciones vacías
      const validAddresses = this.composeForm.toAddresses.filter(addr => addr.trim());

      await this.emailService.sendEmail({
        toAddresses: validAddresses,
        subject: this.composeForm.subject,
        content: this.composeForm.content,
        isHtml: this.composeForm.isHtml,
        attachments: this.composeForm.attachments
      });

      alert('Correo enviado exitosamente');

      // Resetear formulario y volver a inbox
      this.setTab('inbox');

    } catch (error) {
      console.error('Error sending email:', error);
      alert('Error al enviar el correo');
    }
  }

  // 🕒 UTILIDADES DE FORMATO
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString('es-ES', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }

  // 🔄 MÉTODOS DE CARGA HEREDADOS (mantener compatibilidad)
  async loadEmails(filters: Partial<EmailFilter> = {}) {
    // Convertir filtros antiguos a nuevos filtros de búsqueda
    const searchFilters: Partial<EmailSearchFilters> = {
      fromAddress: filters.fromAddress,
      subject: filters.subject,
      isRead: filters.isRead,
      startDate: filters.startDate,
      endDate: filters.endDate,
      type: filters.type,
      page: filters.page || 0,
      size: filters.size || 15,
      sortBy: filters.sortBy || 'receivedDate',
      sortDirection: filters.sortDirection || 'DESC'
    };

    this.searchFilters = { ...this.searchFilters, ...searchFilters };
    await this.performSearch();
  }

  async loadUnreadCount() {
    try {
      console.log('🔄 Cargando conteo de no leídos...');
      this.unreadCount = await this.emailService.getUnreadCount();
      console.log('📊 Correos no leídos:', this.unreadCount);
    } catch (error: any) {
      console.error('❌ Error loading unread count:', error);
    }
  }

  // Método obsoleto - mantener para compatibilidad
  onSearchChange() {
    this.onSearchTextChange();
  }

  // 🎯 MÉTODOS DE CONVENIENCIA PARA CASOS DE USO ESPECÍFICO

  async searchForInvoices() {
    this.searchFilters.searchText = 'factura OR invoice OR pago';
    this.searchFilters.hasAttachments = true;
    this.currentPage = 0;
    await this.performSearch();
  }

  async showTodayEmails() {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

    this.searchFilters.startDate = startOfDay.toISOString();
    this.searchFilters.endDate = endOfDay.toISOString();
    this.currentPage = 0;
    await this.performSearch();
  }

  async showImportantEmails() {
    this.searchFilters.searchText = 'importante OR urgente OR critical OR importante';
    this.searchFilters.isRead = false;
    this.currentPage = 0;
    await this.performSearch();
  }

  // 🔧 MÉTODOS AUXILIARES PARA LA INTERFAZ

  hasActiveFilters(): boolean {
    return !!(
      this.searchFilters.searchText ||
      this.searchFilters.fromAddress ||
      this.searchFilters.subject ||
      this.searchFilters.isRead !== null ||
      this.searchFilters.startDate ||
      this.searchFilters.endDate ||
      this.searchFilters.hasAttachments !== null ||
      this.quickFilters.unreadOnly ||
      this.quickFilters.withAttachmentsOnly ||
      this.quickFilters.todayOnly
    );
  }

  trackByEmailId(index: number, email: Email): number {
    return email.id;
  }

  // 🔍 Método para manejar input de búsqueda con debounce
  private searchTimeout: any;

  onSearchInputChange() {
    // Limpiar timeout anterior
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    // Establecer nuevo timeout para evitar demasiadas búsquedas
    this.searchTimeout = setTimeout(() => {
      this.onSearchTextChange();
    }, 300); // 300ms de delay
  }

  // 🎚️ Método para manejar cambios en filtros rápidos
  onQuickFilterChange() {
    // Este método se mantiene para compatibilidad con el HTML existente
    // Los filtros individuales tienen sus propios métodos toggle
  }

  // 🔧 MÉTODOS DE DIAGNÓSTICO Y PRUEBA
  testLogs: string[] = [];
  lastError: any = null;

  addTestLog(message: string) {
    const timestamp = new Date().toLocaleTimeString();
    this.testLogs.push(`[${timestamp}] ${message}`);
    console.log(`🔧 TEST: ${message}`);

    // Mantener solo los últimos 20 logs
    if (this.testLogs.length > 20) {
      this.testLogs = this.testLogs.slice(-20);
    }
  }

  async testBasicLoad() {
    this.addTestLog('🔄 Iniciando prueba de carga básica...');
    this.lastError = null;

    try {
      this.addTestLog('📡 Probando conexión con EmailService...');

      // Probar método más básico primero
      this.addTestLog('🔍 Intentando searchEmails con filtros vacíos...');
      const response = await this.emailService.searchEmails({
        page: 0,
        size: 5,
        sortBy: 'receivedDate',
        sortDirection: 'DESC'
      });

      this.addTestLog(`✅ Respuesta recibida: ${response.totalElements} correos`);
      this.addTestLog(`📊 Páginas totales: ${response.totalPages}`);
      this.addTestLog(`📧 Correos en esta página: ${response.content?.length || 0}`);

      if (response.content && response.content.length > 0) {
        this.addTestLog(`📝 Primer correo: ${response.content[0].subject}`);
        this.emails = response.content;
        this.totalElements = response.totalElements;
        this.totalPages = response.totalPages;
      } else {
        this.addTestLog('⚠️ No se encontraron correos en la respuesta');
      }

    } catch (error: any) {
      this.lastError = error;
      this.addTestLog(`❌ Error en prueba básica: ${error.message}`);
      this.addTestLog(`🔍 Status: ${error.status}`);
      this.addTestLog(`🔍 URL: ${error.url}`);
    }
  }

  async testSearch() {
    this.addTestLog('🔍 Iniciando prueba de búsqueda...');
    this.lastError = null;

    try {
      await this.performSearch();
      this.addTestLog('✅ Búsqueda completada exitosamente');
    } catch (error: any) {
      this.lastError = error;
      this.addTestLog(`❌ Error en búsqueda: ${error.message}`);
    }
  }

  async testBackendConnection() {
    this.addTestLog('🌐 Probando conexión con backend...');
    this.lastError = null;

    try {
      // Probar endpoint más básico
      this.addTestLog('📡 Probando endpoint de conteo...');
      const count = await this.emailService.getUnreadCount();
      this.addTestLog(`✅ Conteo de no leídos: ${count}`);
      this.unreadCount = count;

    } catch (error: any) {
      this.lastError = error;
      this.addTestLog(`❌ Error de conexión: ${error.message}`);
      this.addTestLog(`🔍 Status: ${error.status}`);

      if (error.status === 0) {
        this.addTestLog('🚨 Error de CORS o backend no disponible');
      } else if (error.status === 401) {
        this.addTestLog('🔐 Error de autenticación - revisar token');
      } else if (error.status === 404) {
        this.addTestLog('🔍 Endpoint no encontrado - revisar URL');
      }
    }
  }
}
