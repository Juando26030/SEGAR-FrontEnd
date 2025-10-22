import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import {
	ResolucionService,
	Resolucion,
	RegistroSanitario,
	TramiteCompleto,
	HistorialTramite
} from '../../../core/services/resolucion.service';
import { TramiteEstadoService } from '../../../core/services/tramite-estado.service';

// Interfaces para el formato de pestañas
interface Tab {
	id: string;
	label: string;
}

interface Obligation {
	title: string;
	description: string;
	frequency: string;
	deadline: string;
}

interface CommercializationRequirement {
	title: string;
	items: string[];
}

interface RenewalStep {
	title: string;
	description: string;
	timeframe: string;
}

interface ContactInfo {
	type: string;
	title: string;
	details: string[];
}

interface UsefulLink {
	title: string;
	url: string;
}

@Component({
	standalone: true,
	selector: 'app-registro-paso-cinco',
	imports: [CommonModule, RouterModule, HttpClientModule],
	templateUrl: './registro-paso-cinco.component.html',
	styleUrls: ['./registro-paso-cinco.component.css']
})
export class RegistroPasoCincoComponent implements OnInit {
	// Sistema de pestañas
	activeTab = 'resolucion';

	readonly tabs: Tab[] = [
		{ id: 'resolucion', label: 'Resolución Final' },
		{ id: 'registro', label: 'Registro Sanitario' },
		{ id: 'obligaciones', label: 'Obligaciones Post-Registro' },
		{ id: 'comercializacion', label: 'Comercialización' },
		{ id: 'renovacion', label: 'Renovación' },
		{ id: 'contacto', label: 'Contacto y Soporte' }
	];

	// Estados del componente
	cargando = false;
	tramiteId: number | null = null;

	// Datos del backend
	tramiteCompleto: TramiteCompleto | null = null;
	resolucion: Resolucion | null = null;
	registroSanitario: RegistroSanitario | null = null;
	historial: HistorialTramite[] = [];

	// Mensajes de estado
	errorMessage = '';
	mensajeExito = '';

	// Datos informativos para las pestañas
	readonly obligations: Obligation[] = [
		{
			title: 'Mantenimiento de Buenas Prácticas de Manufactura (BPM)',
			description: 'Garantizar el cumplimiento continuo de las BPM en todas las etapas de producción, almacenamiento y distribución.',
			frequency: 'Permanente',
			deadline: 'Durante toda la vigencia del registro'
		},
		{
			title: 'Reporte de Cambios Significativos',
			description: 'Informar al INVIMA sobre modificaciones en la formulación, proceso de fabricación, instalaciones o titularidad.',
			frequency: 'Cuando aplique',
			deadline: '30 días calendario previos al cambio'
		},
		{
			title: 'Reporte de Eventos Adversos',
			description: 'Notificar eventos adversos asociados al consumo del producto y medidas correctivas implementadas.',
			frequency: 'Cuando aplique',
			deadline: '24 horas para eventos graves, 15 días para eventos menores'
		},
		{
			title: 'Actualización de Información de Contacto',
			description: 'Mantener actualizada la información de contacto del titular y representante legal ante el INVIMA.',
			frequency: 'Cuando aplique',
			deadline: '10 días calendario posteriores al cambio'
		}
	];

	readonly commercializationRequirements: CommercializationRequirement[] = [
		{
			title: 'Etiquetado Obligatorio',
			items: [
				'Número de registro sanitario visible en el empaque',
				'Información nutricional completa y actualizada',
				'Lista de ingredientes en orden descendente',
				'Fecha de vencimiento y condiciones de almacenamiento',
				'Información del titular del registro'
			]
		},
		{
			title: 'Control de Calidad',
			items: [
				'Análisis fisicoquímicos periódicos',
				'Análisis microbiológicos de rutina',
				'Verificación de vida útil declarada',
				'Control de proveedores de materias primas'
			]
		},
		{
			title: 'Distribución y Comercialización',
			items: [
				'Mantener cadena de frío cuando aplique',
				'Registro de lotes y trazabilidad',
				'Capacitación al personal de ventas',
				'Atención a quejas y reclamos de consumidores'
			]
		},
		{
			title: 'Documentación de Respaldo',
			items: [
				'Conservar registros de producción por 5 años',
				'Mantener evidencia de análisis de laboratorio',
				'Documentar procedimientos operativos estándar',
				'Archivo de certificaciones de proveedores'
			]
		}
	];

	readonly renewalSteps: RenewalStep[] = [
		{
			title: 'Evaluación de Requisitos',
			description: 'Verificar cambios normativos y nuevos requisitos aplicables desde la última renovación.',
			timeframe: '2-3 semanas'
		},
		{
			title: 'Actualización de Documentación',
			description: 'Preparar y actualizar toda la documentación técnica y legal requerida.',
			timeframe: '4-6 semanas'
		},
		{
			title: 'Solicitud de Renovación',
			description: 'Radicar la solicitud de renovación con toda la documentación en la plataforma INVIMA.',
			timeframe: '1 semana'
		},
		{
			title: 'Seguimiento y Respuesta',
			description: 'Atender requerimientos del INVIMA y realizar seguimiento hasta obtener la resolución.',
			timeframe: '8-12 semanas'
		}
	];

	readonly renewalDocuments: string[] = [
		'Formulario de solicitud de renovación debidamente diligenciado',
		'Certificado de existencia y representación legal actualizado',
		'Ficha técnica del producto actualizada',
		'Análisis fisicoquímicos y microbiológicos recientes',
		'Certificación de Buenas Prácticas de Manufactura vigente',
		'Declaración de no modificación del producto (si aplica)',
		'Comprobante de pago de las tarifas correspondientes'
	];

	readonly contactInfo: ContactInfo[] = [
		{
			type: 'phone',
			title: 'Línea de Atención',
			details: [
				'Teléfono: (601) 242 50 00',
				'Línea gratuita: 018000 122 100',
				'Horario: Lunes a viernes 8:00 AM - 5:00 PM'
			]
		},
		{
			type: 'email',
			title: 'Correo Electrónico',
			details: [
				'atencionalciudadano@invima.gov.co',
				'Respuesta en 5 días hábiles',
				'Incluir número de registro en el asunto'
			]
		},
		{
			type: 'office',
			title: 'Oficina Principal',
			details: [
				'Carrera 68D No. 17-11/21',
				'Bogotá D.C., Colombia',
				'Atención presencial con cita previa'
			]
		},
		{
			type: 'online',
			title: 'Servicios en Línea',
			details: [
				'Portal web: www.invima.gov.co',
				'Consulta de trámites 24/7',
				'Chat en línea: Lunes a viernes 8:00 AM - 5:00 PM'
			]
		}
	];

	readonly usefulLinks: UsefulLink[] = [
		{ title: 'Portal INVIMA', url: 'https://www.invima.gov.co' },
		{ title: 'Consulta de Registros Sanitarios', url: 'https://www.invima.gov.co/consultas-publicas' },
		{ title: 'Normatividad Vigente', url: 'https://www.invima.gov.co/normatividad' },
		{ title: 'Guías y Documentos Técnicos', url: 'https://www.invima.gov.co/documentos-tecnicos' },
		{ title: 'Estado de Trámites', url: 'https://tramiteslinea.invima.gov.co' },
		{ title: 'Formularios y Formatos', url: 'https://www.invima.gov.co/formularios' }
	];

	constructor(
		public router: Router,
		private route: ActivatedRoute,
		private resolucionService: ResolucionService,
		private tramiteEstadoService: TramiteEstadoService
	) {}

	async ngOnInit(): Promise<void> {
		// Obtener el ID del trámite desde la ruta o desde el servicio de estado
		this.tramiteId = this.obtenerTramiteId();

		if (this.tramiteId) {
			await this.cargarDatosTramite();
		} else {
			this.errorMessage = 'No se encontró un trámite válido para consultar la resolución.';
		}
	}

	private obtenerTramiteId(): number | null {
		// Intentar obtener desde parámetros de ruta
		const routeId = this.route.snapshot.paramMap.get('id');
		if (routeId) {
			return parseInt(routeId, 10);
		}

		// Para efectos de demostración, usar un ID simulado
		// En producción, esto vendría del estado persistido o parámetros de ruta
		return 1; // ID simulado para pruebas
	}

	private async cargarDatosTramite(): Promise<void> {
		if (!this.tramiteId) return;

		this.cargando = true;
		this.errorMessage = '';

		try {
			// Intentar cargar datos reales del backend
			try {
				// Cargar información completa del trámite
				this.tramiteCompleto = await firstValueFrom(
					this.resolucionService.obtenerTramiteCompleto(this.tramiteId)
				);

				// Cargar resolución
				this.resolucion = await firstValueFrom(
					this.resolucionService.obtenerResolucion(this.tramiteId)
				);

				// Si está aprobado, cargar registro sanitario
				if (this.resolucion.estado === 'APROBADA') {
					try {
						this.registroSanitario = await firstValueFrom(
							this.resolucionService.obtenerRegistroSanitario(this.tramiteId)
						);
					} catch (error) {
						console.warn('Registro sanitario no disponible aún:', error);
					}
				}

				// Cargar historial
				this.historial = await firstValueFrom(
					this.resolucionService.obtenerHistorial(this.tramiteId)
				);

				console.log('Datos del trámite cargados desde backend:', {
					tramite: this.tramiteCompleto,
					resolucion: this.resolucion,
					registro: this.registroSanitario,
					historial: this.historial
				});
			} catch (backendError: any) {
				console.warn('Backend no disponible o sin datos, usando datos de demostración:', backendError);

				// Usar datos de demostración para mostrar la funcionalidad
				this.cargarDatosDemostracion();

				this.mensajeExito = '📋 Mostrando datos de demostración - El backend está siendo configurado';
			}

		} catch (error: any) {
			console.error('Error general cargando datos del trámite:', error);
			this.errorMessage = error.message || 'Error al cargar la información del trámite.';
		} finally {
			this.cargando = false;
		}
	}

	private cargarDatosDemostracion(): void {
		// Obtener datos del trámite en proceso para personalizar la demostración
		const tramiteEnProceso = this.tramiteEstadoService.getTramiteActual();

		// Datos de demostración realistas
		this.tramiteCompleto = {
			id: this.tramiteId!,
			numeroRadicado: `RS-2024-${String(this.tramiteId).padStart(6, '0')}`,
			estado: 'APROBADA',
			fechaCreacion: new Date('2024-08-15T10:30:00'),
			empresaId: tramiteEnProceso?.empresa?.id || 1,
			productoId: tramiteEnProceso?.producto?.id || 1,
			historial: []
		};

		this.resolucion = {
			id: 1,
			numeroResolucion: `2024-INVIMA-${String(this.tramiteId).padStart(4, '0')}`,
			fechaEmision: new Date('2024-08-30T14:00:00'),
			autoridad: 'INVIMA - Instituto Nacional de Vigilancia de Medicamentos y Alimentos',
			estado: 'APROBADA',
			observaciones: 'Solicitud aprobada. El producto cumple con todos los requisitos técnicos y normativos establecidos para alimentos procesados. Se autoriza la comercialización bajo las condiciones especificadas.',
			tramiteId: this.tramiteId!,
			documentoUrl: '/documents/resolucion-2024-001.pdf',
			fechaNotificacion: new Date('2024-08-30T16:00:00')
		};

		this.registroSanitario = {
			id: 1,
			numeroRegistro: `RSAA21M-2024${String(this.tramiteId).padStart(4, '0')}`,
			fechaExpedicion: new Date('2024-08-30T14:00:00'),
			fechaVencimiento: new Date('2029-08-30T23:59:59'),
			productoId: tramiteEnProceso?.producto?.id || 1,
			empresaId: tramiteEnProceso?.empresa?.id || 1,
			estado: 'VIGENTE',
			resolucionId: 1,
			documentoUrl: '/documents/registro-sanitario-2024-001.pdf'
		};

		this.historial = [
			{
				id: 1,
				tramiteId: this.tramiteId!,
				fecha: new Date('2024-08-15T10:30:00'),
				accion: 'Solicitud Radicada',
				descripcion: 'Solicitud de registro sanitario radicada exitosamente en el sistema INVIMA',
				usuario: 'Sistema SEGAR',
				estado: 'RADICADA'
			},
			{
				id: 2,
				tramiteId: this.tramiteId!,
				fecha: new Date('2024-08-20T09:15:00'),
				accion: 'Revisión Técnica Iniciada',
				descripcion: 'Evaluación técnica de documentación y cumplimiento de requisitos',
				usuario: 'Especialista INVIMA',
				estado: 'EN_REVISION'
			},
			{
				id: 3,
				tramiteId: this.tramiteId!,
				fecha: new Date('2024-08-28T11:45:00'),
				accion: 'Evaluación de Laboratorio',
				descripcion: 'Revisión de análisis fisicoquímicos y microbiológicos del producto',
				usuario: 'Laboratorio INVIMA',
				estado: 'EN_REVISION'
			},
			{
				id: 4,
				tramiteId: this.tramiteId!,
				fecha: new Date('2024-08-30T14:00:00'),
				accion: 'Resolución Emitida',
				descripcion: 'Resolución de aprobación emitida - Registro sanitario autorizado',
				usuario: 'Director Técnico INVIMA',
				estado: 'APROBADA'
			}
		];

		// Personalizar datos con información real del trámite si está disponible
		if (tramiteEnProceso?.empresa?.razonSocial) {
			this.resolucion.observaciones = `Solicitud aprobada para ${tramiteEnProceso.empresa.razonSocial}. El producto "${tramiteEnProceso.producto?.nombre || 'producto alimentario'}" cumple con todos los requisitos técnicos y normativos establecidos.`;
		}

		console.log('Datos de demostración cargados:', {
			tramite: this.tramiteCompleto,
			resolucion: this.resolucion,
			registro: this.registroSanitario,
			historial: this.historial
		});
	}

	async descargarResolucion(): Promise<void> {
		if (!this.tramiteId) return;

		try {
			const blob = await firstValueFrom(
				this.resolucionService.descargarResolucion(this.tramiteId)
			);

			this.descargarArchivo(blob, `resolucion-${this.resolucion?.numeroResolucion || this.tramiteId}.pdf`);
		} catch (error: any) {
			console.error('Error descargando resolución:', error);
			alert('Error al descargar la resolución: ' + (error.message || 'Error desconocido'));
		}
	}

	async descargarRegistroSanitario(): Promise<void> {
		if (!this.tramiteId || !this.registroSanitario) return;

		try {
			const blob = await firstValueFrom(
				this.resolucionService.descargarRegistroSanitario(this.tramiteId)
			);

			this.descargarArchivo(blob, `registro-sanitario-${this.registroSanitario.numeroRegistro}.pdf`);
		} catch (error: any) {
			console.error('Error descargando registro sanitario:', error);
			alert('Error al descargar el registro sanitario: ' + (error.message || 'Error desconocido'));
		}
	}

	private descargarArchivo(blob: Blob, nombreArchivo: string): void {
		const url = window.URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.download = nombreArchivo;
		link.click();
		window.URL.revokeObjectURL(url);
	}

	async finalizarTramite(): Promise<void> {
		if (!this.tramiteId) return;

		if (confirm('¿Está seguro de que desea finalizar este trámite? Esta acción no se puede deshacer.')) {
			try {
				await firstValueFrom(
					this.resolucionService.finalizarTramite(this.tramiteId)
				);

				this.mensajeExito = 'Trámite finalizado exitosamente.';
				this.tramiteEstadoService.actualizarEstado('FINALIZADA');

				// Recargar datos
				await this.cargarDatosTramite();
			} catch (error: any) {
				console.error('Error finalizando trámite:', error);
				this.errorMessage = error.message || 'Error al finalizar el trámite.';
			}
		}
	}

	consultarNuevoEstado(): void {
		this.cargarDatosTramite();
	}

	nuevaSolicitud(): void {
		this.tramiteEstadoService.limpiarTramite();
		this.router.navigate(['/main/nuevo/registro/paso-1']);
	}

	// Métodos de utilidad
	setActiveTab(tab: string): void {
		this.activeTab = tab;
	}

	formatearFecha(fecha: Date | string): string {
		if (!fecha) return '';
		const fechaObj = typeof fecha === 'string' ? new Date(fecha) : fecha;
		return fechaObj.toLocaleDateString('es-CO', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	formatearFechaCorta(fecha: Date | string): string {
		if (!fecha) return '';
		const fechaObj = typeof fecha === 'string' ? new Date(fecha) : fecha;
		return fechaObj.toLocaleDateString('es-CO', {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit'
		});
	}

	getEstadoColor(estado: string): string {
		switch (estado) {
			case 'APROBADA':
			case 'VIGENTE':
				return 'text-green-700 bg-green-50 border-green-200';
			case 'RECHAZADA':
			case 'VENCIDO':
			case 'SUSPENDIDO':
				return 'text-red-700 bg-red-50 border-red-200';
			case 'EN_REVISION':
				return 'text-yellow-700 bg-yellow-50 border-yellow-200';
			default:
				return 'text-gray-700 bg-gray-50 border-gray-200';
		}
	}

	getEstadoIcon(estado: string): string {
		switch (estado) {
			case 'APROBADA':
			case 'VIGENTE':
				return `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>`;
			case 'RECHAZADA':
			case 'VENCIDO':
			case 'SUSPENDIDO':
				return `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>`;
			case 'EN_REVISION':
				return `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>`;
			default:
				return `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>`;
		}
	}

	getRenewalDeadline(): string {
		if (!this.registroSanitario?.fechaVencimiento) return '';

		const expiryDate = new Date(this.registroSanitario.fechaVencimiento);
		const renewalDeadline = new Date(expiryDate);
		renewalDeadline.setMonth(renewalDeadline.getMonth() - 6);

		return renewalDeadline.toLocaleDateString('es-CO', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}

	getDiasRestantes(): number {
		if (!this.registroSanitario?.fechaVencimiento) return 0;

		const hoy = new Date();
		const vencimiento = new Date(this.registroSanitario.fechaVencimiento);
		const diferencia = vencimiento.getTime() - hoy.getTime();

		return Math.ceil(diferencia / (1000 * 3600 * 24));
	}

	startRenewalProcess(): void {
		alert('Redirigiendo al proceso de renovación de registro sanitario');
		console.log('Iniciando renovación para registro:', this.registroSanitario?.numeroRegistro);
	}

	setRenewalReminder(): void {
		alert('Recordatorio configurado para 6 meses antes del vencimiento');
		console.log('Recordatorio configurado para registro:', this.registroSanitario?.numeroRegistro);
	}

	getContactIcon(iconType: string): string {
		const icons: Record<string, string> = {
			phone: `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>`,
			email: `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>`,
			office: `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>`,
			online: `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9m0 9c4.97 0 9-4.03 9-9s-4.03-9 9-9m9 9a9 9 0 01-9 9" />
      </svg>`
		};
		return icons[iconType] || '';
	}

	// TrackBy functions para optimización
	trackByTab(index: number, tab: Tab): string {
		return tab.id;
	}

	trackByObligation(index: number, obligation: Obligation): string {
		return obligation.title;
	}

	trackByRequirement(index: number, requirement: CommercializationRequirement): string {
		return requirement.title;
	}

	trackByRenewalStep(index: number, step: RenewalStep): string {
		return step.title;
	}

	trackByContact(index: number, contact: ContactInfo): string {
		return contact.type;
	}

	trackByLink(index: number, link: UsefulLink): string {
		return link.url;
	}

	trackByString(index: number, item: string): string {
		return item;
	}

	trackByHistorial(index: number, item: HistorialTramite): number {
		return item.id;
	}
}
