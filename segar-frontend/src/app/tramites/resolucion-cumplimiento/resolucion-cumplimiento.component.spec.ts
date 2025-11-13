import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResolucionCumplimientoComponent } from './resolucion-cumplimiento.component';

describe('ResolucionCumplimientoComponent', () => {
  let component: ResolucionCumplimientoComponent = null as any;
  let fixture: ComponentFixture<ResolucionCumplimientoComponent> = null as any;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResolucionCumplimientoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResolucionCumplimientoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
