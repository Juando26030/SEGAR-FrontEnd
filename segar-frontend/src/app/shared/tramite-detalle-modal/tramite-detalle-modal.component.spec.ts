import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { TramiteDetalleModalComponent } from './tramite-detalle-modal.component';

describe('TramiteDetalleModalComponent', () => {
  let component: TramiteDetalleModalComponent = null as any;
  let fixture: ComponentFixture<TramiteDetalleModalComponent> = null as any;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TramiteDetalleModalComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TramiteDetalleModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
