import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-stat-card',
  imports: [CommonModule],
  templateUrl: './user-stat-card.component.html',
  styleUrl: './user-stat-card.component.css'
})
export class UserStatCardComponent {
  @Input() title: string = '';
  @Input() value: string = '';
  @Input() icon: string = 'document';
  @Input() color: string = 'blue';

  getIconPath(): string {
    const icons: { [key: string]: string } = {
      'document': 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      'check': 'M5 13l4 4L19 7',
      'clock': 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
      'users': 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z'
    };
    return icons[this.icon] || icons['document'];
  }

  getColorClasses(): string {
    const colors: { [key: string]: string } = {
      'blue': 'bg-blue-500',
      'green': 'bg-green-500',
      'purple': 'bg-purple-500',
      'red': 'bg-red-500',
      'yellow': 'bg-yellow-500'
    };
    return colors[this.color] || colors['blue'];
  }
}
