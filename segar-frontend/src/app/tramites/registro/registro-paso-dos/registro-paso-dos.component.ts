import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-registro-paso-dos',
  imports: [CommonModule, FormsModule],
  templateUrl: './registro-paso-dos.component.html',
  styleUrls: ['./registro-paso-dos.component.css']
})
export class RegistroPasoDosComponent {
  activeTab = 'registro';

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  // Modelo de documento dinámico (simplificado)
  dynamicDocument = {
    category: 'technical',
    type: 'ficha-tecnica',
    productName: 'Galletas Integrales',
    brand: 'NatureBite',
    presentation: 'Paquete x 250g',
    shelfLife: 12,
    shelfLifeUnit: 'months',
    description: 'Galletas elaboradas con harina integral, avena y miel.',
    ingredients: 'Harina integral, avena, miel, azúcar, aceite vegetal, sal, bicarbonato.',
    additives: [
      { name: 'Lecitina de soya', code: 'E322', function: 'Emulsificante' }
    ]
  };
}
