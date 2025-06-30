import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, registerables } from 'chart.js';

@Component({
  standalone: true,
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements AfterViewInit {
  ngAfterViewInit(): void {
    Chart.register(...registerables);

    const ctx1 = document.getElementById('tramitesChart') as HTMLCanvasElement;
    new Chart(ctx1, {
      type: 'line',
      data: {
        labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
        datasets: [{
          label: 'Trámites',
          data: [15, 20, 18, 25, 30, 28],
          borderColor: '#2563EB',
          tension: 0.3,
          fill: false
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });

    const ctx2 = document.getElementById('tipoChart') as HTMLCanvasElement;
    new Chart(ctx2, {
      type: 'doughnut',
      data: {
        labels: ['Registro', 'Modificación', 'Renovación'],
        datasets: [{
          data: [40, 30, 30],
          backgroundColor: ['#3B82F6', '#10B981', '#F59E0B']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom' }
        }
      }
    });
  }
}
