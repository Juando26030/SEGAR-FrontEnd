import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { BusquedaGlobalComponent } from './busqueda-global.component';

describe('BusquedaGlobalComponent', () => {
  let component: BusquedaGlobalComponent = null as any;
  let fixture: ComponentFixture<BusquedaGlobalComponent> = null as any;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BusquedaGlobalComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BusquedaGlobalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
