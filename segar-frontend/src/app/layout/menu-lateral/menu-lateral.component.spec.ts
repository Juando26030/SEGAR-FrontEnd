import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { MenuLateralComponent } from './menu-lateral.component';

describe('MenuLateralComponent', () => {
  let component: MenuLateralComponent = null as any;
  let fixture: ComponentFixture<MenuLateralComponent> = null as any;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MenuLateralComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MenuLateralComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
