import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface DiaCalendario {
  dia: number;
  tipo?: 'vencimiento' | 'evento' | 'recordatorio';
  titulo?: string;
  otra?: boolean;
}

@Component({
  standalone: true,
  selector: 'app-calendario',
  templateUrl: './calendario.component.html',
  imports: [CommonModule]
})
export class CalendarioComponent implements OnInit {
  calendarDays: DiaCalendario[] = [];

  ngOnInit(): void {
    // Simulación: calendario de julio 2025
    const diasPrevios: DiaCalendario[] = [
      { dia: 29, otra: true }, { dia: 30, otra: true }
    ];

    const diasMes: DiaCalendario[] = Array.from({ length: 31 }, (_, i) => ({ dia: i + 1 }));

    // Simulamos algunos eventos
    diasMes[4].tipo = 'evento';
    diasMes[4].titulo = 'Visita INVIMA';

    diasMes[10].tipo = 'vencimiento';
    diasMes[10].titulo = 'Vence Yogur ABC';

    diasMes[15].tipo = 'recordatorio';
    diasMes[15].titulo = 'Enviar muestras';

    diasMes[20].tipo = 'evento';
    diasMes[20].titulo = 'Audiencia técnica';

    diasMes[24].tipo = 'vencimiento';
    diasMes[24].titulo = 'Renovar Registro XYZ';

    this.calendarDays = [...diasPrevios, ...diasMes];
  }
}
