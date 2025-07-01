import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistroPasoUnoComponent } from './registro-paso-uno.component';

describe('RegistroPasoUnoComponent', () => {
  let component: RegistroPasoUnoComponent;
  let fixture: ComponentFixture<RegistroPasoUnoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistroPasoUnoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegistroPasoUnoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
