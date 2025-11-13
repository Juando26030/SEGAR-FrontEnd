import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { EmailService, Email, EmailPage, SendEmailRequest, EmailSearchFilters } from './email.service';
import { AuthService } from '../auth/services/auth.service';

describe('EmailService', () => {
  let service: EmailService = null as any;
  let httpMock: HttpTestingController = null as any;
  let authService: jest.Mocked<AuthService> = null as any;

  const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.token';
  const API_BASE_URL = 'http://35.238.19.224:8090/api/notifications/emails';

  const mockEmail: Email  = {
    id: 1,
    fromAddress: 'sender@example.com',
    toAddresses: ['receiver@example.com'],
    subject: 'Test Email',
    content: 'This is a test email',
    isHtml: false,
    isRead: false,
    status: 'SENT',
    type: 'INBOUND',
    sentDate: '2024-01-01T10:00:00',
    receivedDate: '2024-01-01T10:01:00',
    attachments: [],
    attachmentCount: 0
  };

  const mockEmailPage: EmailPage  = {
    content: [mockEmail],
    totalElements: 1,
    totalPages: 1,
    size: 10,
    number: 0
  };

  beforeEach(() => {
    const authServiceMock: any  = {
      getToken: jest.fn()
    };
    
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        EmailService,
        { provide: AuthService, useValue: authServiceMock }
      ]
    });

    service = TestBed.inject(EmailService);
    httpMock = TestBed.inject(HttpTestingController);
    authService = TestBed.inject(AuthService) as jest.Mocked<AuthService>;
    
    // Configurar token por defecto
    authService.getToken.mockReturnValue(mockToken);
  });

  afterEach(() => {
    httpMock.verify(); // Verifica que no haya requests pendientes
  });

  // ==================== TESTS DE INICIALIZACIÓN ====================

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // ==================== TESTS DE AUTENTICACIÓN ====================

  describe('Authentication', () => {
    it('should include Bearer token in headers', async () => {
      // Arrange
      const promise = service.getInbox({ page: 0, size: 10 });

      // Act
      const req = httpMock.expectOne(`${API_BASE_URL}/inbox?page=0&size=10`);

      // Assert
      expect(req.request.headers.has('Authorization')).toBe(true);
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);
      
      req.flush(mockEmailPage);
      await promise;
    });

    it('should throw error when token is not available', async () => {
      // Arrange
      authService.getToken.mockReturnValue(undefined);

      // Act & Assert
      try {
        await service.getInbox();
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.message).toContain('Token de autenticación no encontrado');
      }
    });

    it('should handle 401 unauthorized error', async () => {
      // Arrange
      const promise = service.getInbox({ page: 0, size: 10 });

      // Act
      const req = httpMock.expectOne(`${API_BASE_URL}/inbox?page=0&size=10`);
      req.flush({ message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });

      // Assert
      try {
        await promise;
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  // ==================== TESTS DE BANDEJA DE ENTRADA ====================

  describe('Inbox Operations', () => {
    it('should get inbox with basic pagination', async () => {
      // Arrange
      const promise = service.getInbox({ page: 0, size: 10 });

      // Act
      const req = httpMock.expectOne(`${API_BASE_URL}/inbox?page=0&size=10`);
      expect(req.request.method).toBe('GET');
      req.flush(mockEmailPage);

      // Assert
      const result = await promise;
      expect(result).toEqual(mockEmailPage);
      expect(result.content.length).toBe(1);
      expect(result.content[0].subject).toBe('Test Email');
    });

    it('should get inbox with filters using POST', async () => {
      // Arrange
      const filters = {
        fromAddress: 'sender@example.com',
        isRead: false,
        page: 0,
        size: 10
      };
      const promise = service.getInbox(filters);

      // Act
      const req = httpMock.expectOne(`${API_BASE_URL}/inbox`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(filters);
      req.flush(mockEmailPage);

      // Assert
      const result = await promise;
      expect(result).toEqual(mockEmailPage);
    });

    it('should handle empty inbox', async () => {
      // Arrange
      const emptyPage: EmailPage  = {
        content: [],
        totalElements: 0,
        totalPages: 0,
        size: 10,
        number: 0
      };
      const promise = service.getInbox({ page: 0, size: 10 });

      // Act
      const req = httpMock.expectOne(`${API_BASE_URL}/inbox?page=0&size=10`);
      req.flush(emptyPage);

      // Assert
      const result = await promise;
      expect(result.content).toEqual([]);
      expect(result.totalElements).toBe(0);
    });
  });

  // ==================== TESTS DE BÚSQUEDA AVANZADA ====================

  describe('Advanced Search', () => {
    it('should search emails with text filter', async () => {
      // Arrange
      const filters: Partial<EmailSearchFilters>  = {
        searchText: 'test',
        page: 0,
        size: 15
      };
      const promise = service.searchEmails(filters);

      // Act
      const req = httpMock.expectOne((request) => 
        request.url.includes(`${API_BASE_URL}/inbox`) && 
        request.params.get('searchText') === 'test'
      );
      req.flush(mockEmailPage);

      // Assert
      const result = await promise;
      expect(result).toEqual(mockEmailPage);
    });

    it('should filter by unread emails', async () => {
      // Arrange
      const promise = service.getUnreadEmails(0, 20);

      // Act
      const req = httpMock.expectOne((request) => 
        request.url.includes(`${API_BASE_URL}/inbox`) &&
        request.params.get('isRead') === 'false'
      );
      req.flush(mockEmailPage);

      // Assert
      const result = await promise;
      expect(result.content.length).toBeGreaterThanOrEqual(0);
    });

    it('should filter by sender', async () => {
      // Arrange
      const promise = service.filterByFrom('sender@example.com', 0, 15);

      // Act
      const req = httpMock.expectOne((request) => 
        request.url.includes(`${API_BASE_URL}/inbox`) &&
        request.params.get('fromAddress') === 'sender@example.com'
      );
      req.flush(mockEmailPage);

      // Assert
      const result = await promise;
      expect(result).toEqual(mockEmailPage);
    });

    it('should filter by date range', async () => {
      // Arrange
      const startDate = '2024-01-01T00:00:00';
      const endDate = '2024-01-31T23:59:59';
      const promise = service.filterByDateRange(startDate, endDate, 0, 25);

      // Act
      const req = httpMock.expectOne((request) => 
        request.url.includes(`${API_BASE_URL}/inbox`) &&
        request.params.get('startDate') === startDate &&
        request.params.get('endDate') === endDate
      );
      req.flush(mockEmailPage);

      // Assert
      const result = await promise;
      expect(result).toEqual(mockEmailPage);
    });

    it('should filter emails with attachments', async () => {
      // Arrange
      const promise = service.getEmailsWithAttachments(0, 10);

      // Act
      const req = httpMock.expectOne((request) => 
        request.url.includes(`${API_BASE_URL}/inbox`) &&
        request.params.get('hasAttachments') === 'true'
      );
      req.flush(mockEmailPage);

      // Assert
      const result = await promise;
      expect(result).toEqual(mockEmailPage);
    });

    it('should fallback to basic method on 405 error', async () => {
      // Arrange
      const filters: Partial<EmailSearchFilters>  = {
        searchText: 'test',
        page: 0,
        size: 15
      };
      const promise = service.searchEmails(filters);

      // Act - Primera petición falla con 405
      const req1 = httpMock.expectOne((request) => 
        request.url.includes(`${API_BASE_URL}/inbox`)
      );
      req1.flush({ message: 'Method Not Allowed' }, { status: 405, statusText: 'Method Not Allowed' });

      // Segunda petición con fallback
      const req2 = httpMock.expectOne((request) => 
        request.url.includes(`${API_BASE_URL}/inbox`)
      );
      req2.flush(mockEmailPage);

      // Assert
      const result = await promise;
      expect(result).toEqual(mockEmailPage);
    });
  });

  // ==================== TESTS DE ENVÍO DE EMAILS ====================

  describe('Send Email', () => {
    it('should send email successfully', async () => {
      // Arrange
      const sendRequest: SendEmailRequest  = {
        toAddresses: ['receiver@example.com'],
        subject: 'Test Subject',
        content: 'Test Content',
        isHtml: false,
        attachments: []
      };
      const promise = service.sendEmail(sendRequest);

      // Act
      const req = httpMock.expectOne(`${API_BASE_URL}/send`);
      expect(req.request.method).toBe('POST');
      req.flush({});

      // Assert
      await expect(promise).resolves.toBeDefined();
    });

    it('should send HTML email', async () => {
      // Arrange
      const sendRequest: SendEmailRequest  = {
        toAddresses: ['receiver@example.com'],
        subject: 'HTML Email',
        content: '<h1>HTML Content</h1>',
        isHtml: true,
        attachments: []
      };
      const promise = service.sendEmail(sendRequest);

      // Act
      const req = httpMock.expectOne(`${API_BASE_URL}/send`);
      req.flush({});

      // Assert
      await expect(promise).resolves.toBeDefined();
    });

    it('should handle send email error', async () => {
      // Arrange
      const sendRequest: SendEmailRequest  = {
        toAddresses: ['invalid-email'],
        subject: 'Test',
        content: 'Test',
        isHtml: false,
        attachments: []
      };
      const promise = service.sendEmail(sendRequest);

      // Act
      const req = httpMock.expectOne(`${API_BASE_URL}/send`);
      req.flush({ message: 'Invalid email' }, { status: 400, statusText: 'Bad Request' });

      // Assert
      await expect(promise).rejects.toThrow();
    });
  });

  // ==================== TESTS DE OPERACIONES SOBRE EMAILS ====================

  describe('Email Operations', () => {
    it('should mark email as read', async () => {
      // Arrange
      const promise = service.markAsRead(1);

      // Act
      const req = httpMock.expectOne(`${API_BASE_URL}/1/mark-read`);
      expect(req.request.method).toBe('PUT');
      req.flush({});

      // Assert
      await expect(promise).resolves.toBeDefined();
    });

    it('should mark email as unread', async () => {
      // Arrange
      const promise = service.markAsUnread(1);

      // Act
      const req = httpMock.expectOne(`${API_BASE_URL}/1/mark-unread`);
      expect(req.request.method).toBe('PUT');
      req.flush({});

      // Assert
      await expect(promise).resolves.toBeDefined();
    });

    it('should delete email', async () => {
      // Arrange
      const promise = service.deleteEmail(1);

      // Act
      const req = httpMock.expectOne(`${API_BASE_URL}/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush({});

      // Assert
      await expect(promise).resolves.toBeDefined();
    });
  });

  // ==================== TESTS DE CORREOS ENVIADOS ====================

  describe('Sent Emails', () => {
    it('should get sent emails', async () => {
      // Arrange
      const promise = service.getSentEmails({ page: 0, size: 10 });

      // Act
      const req = httpMock.expectOne(`${API_BASE_URL}/sent?page=0&size=10`);
      expect(req.request.method).toBe('GET');
      req.flush(mockEmailPage);

      // Assert
      const result = await promise;
      expect(result).toEqual(mockEmailPage);
    });
  });

  // ==================== TESTS DE CONTADORES ====================

  describe('Counters', () => {
    it('should get unread count', async () => {
      // Arrange
      const promise = service.getUnreadCount();

      // Act
      const req = httpMock.expectOne(`${API_BASE_URL}/unread-count`);
      expect(req.request.method).toBe('GET');
      req.flush(5);

      // Assert
      const result = await promise;
      expect(result).toBe(5);
    });

    it('should handle zero unread emails', async () => {
      // Arrange
      const promise = service.getUnreadCount();

      // Act
      const req = httpMock.expectOne(`${API_BASE_URL}/unread-count`);
      req.flush(0);

      // Assert
      const result = await promise;
      expect(result).toBe(0);
    });
  });

  // ==================== TESTS DE ADJUNTOS ====================

  describe('Attachments', () => {
    it('should generate correct download URL', () => {
      // Act
      const url = service.getAttachmentDownloadUrl(1, 10);

      // Assert
      expect(url).toBe(`${API_BASE_URL}/1/attachments/10/download`);
    });
  });

  // ==================== TESTS DE BÚSQUEDAS ESPECÍFICAS ====================

  describe('Specific Search Methods', () => {
    it('should search in emails with text', async () => {
      // Arrange
      const promise = service.searchInEmails('invoice', 0, 10);

      // Act
      const req = httpMock.expectOne((request) => 
        request.url.includes(`${API_BASE_URL}/inbox`) &&
        request.params.get('searchText') === 'invoice'
      );
      req.flush(mockEmailPage);

      // Assert
      const result = await promise;
      expect(result).toEqual(mockEmailPage);
    });

    it('should find unread invoices with complex filter', async () => {
      // Arrange
      const promise = service.findUnreadInvoices(0, 15);

      // Act
      const req = httpMock.expectOne((request) => 
        request.url.includes(`${API_BASE_URL}/inbox`) &&
        request.params.get('isRead') === 'false' &&
        request.params.get('hasAttachments') === 'true'
      );
      req.flush(mockEmailPage);

      // Assert
      const result = await promise;
      expect(result).toBeDefined();
    });
  });

  // ==================== TESTS DE CASOS EDGE ====================

  describe('Edge Cases', () => {
    it('should handle network error', async () => {
      // Arrange
      const promise = service.getInbox({ page: 0, size: 10 });

      // Act
      const req = httpMock.expectOne(`${API_BASE_URL}/inbox?page=0&size=10`);
      req.error(new ErrorEvent('Network error'));

      // Assert
      await expect(promise).rejects.toThrow();
    });

    it('should handle timeout', async () => {
      // Arrange
      const promise = service.getInbox({ page: 0, size: 10 });

      // Act
      const req = httpMock.expectOne(`${API_BASE_URL}/inbox?page=0&size=10`);
      req.flush({ message: 'Timeout' }, { status: 408, statusText: 'Request Timeout' });

      // Assert
      await expect(promise).rejects.toThrow();
    });

    it('should handle large page size', async () => {
      // Arrange
      const promise = service.getInbox({ page: 0, size: 1000 });

      // Act
      const req = httpMock.expectOne(`${API_BASE_URL}/inbox?page=0&size=1000`);
      req.flush(mockEmailPage);

      // Assert
      const result = await promise;
      expect(result).toBeDefined();
    });
  });
});
