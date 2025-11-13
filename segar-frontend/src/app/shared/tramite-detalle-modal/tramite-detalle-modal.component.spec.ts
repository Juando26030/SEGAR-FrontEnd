import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TramiteDetalleModalComponent } from './tramite-detalle-modal.component';

describe('TramiteDetalleModalComponent', () => {
  let component: TramiteDetalleModalComponent = null as any;
  let fixture: ComponentFixture<TramiteDetalleModalComponent> = null as any;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TramiteDetalleModalComponent]
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
