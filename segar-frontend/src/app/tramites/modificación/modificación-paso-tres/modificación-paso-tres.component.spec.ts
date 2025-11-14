import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModificacionPasoTresComponent } from './modificación-paso-tres.component';

describe('ModificacionPasoTresComponent', () => {
  let component: ModificacionPasoTresComponent;
  let fixture: ComponentFixture<ModificacionPasoTresComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModificacionPasoTresComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModificacionPasoTresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
