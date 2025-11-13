import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistroPasoTresComponent } from './registro-paso-tres.component';

describe('RegistroPasoTresComponent', () => {
  let component: RegistroPasoTresComponent = null as any;
  let fixture: ComponentFixture<RegistroPasoTresComponent> = null as any;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistroPasoTresComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegistroPasoTresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
