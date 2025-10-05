import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TramiteDetalleModalComponent } from './tramite-detalle-modal.component';

describe('TramiteDetalleModalComponent', () => {
  let component: TramiteDetalleModalComponent;
  let fixture: ComponentFixture<TramiteDetalleModalComponent>;

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
