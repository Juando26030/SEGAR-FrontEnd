import { Component, ElementRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuLateralComponent } from '../menu-lateral/menu-lateral.component';
import { BarraSuperiorComponent } from '../barra-superior/barra-superior.component';

@Component({
  standalone: true,
  selector: 'app-menu-layout',
  templateUrl: './menu-layout.component.html',
  styleUrls: ['./menu-layout.component.css'],
  imports: [CommonModule, RouterModule, MenuLateralComponent, BarraSuperiorComponent]
})
export class MenuLayoutComponent implements OnInit {
  constructor(private readonly el: ElementRef) {}

  ngOnInit(): void {
    const button = this.el.nativeElement.querySelector('#mobile-menu-button');
    const menu = this.el.nativeElement.querySelector('#mobile-menu');

    if (button && menu) {
      button.addEventListener('click', () => {
        menu.classList.toggle('hidden');
      });

      document.addEventListener('click', (event) => {
        if (!button.contains(event.target) && !menu.contains(event.target)) {
          menu.classList.add('hidden');
        }
      });
    }
  }
}
