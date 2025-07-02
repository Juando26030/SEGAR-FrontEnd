import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistroPasoCuatroComponent } from './registro-paso-cuatro.component';

describe('RegistroPasoCuatroComponent', () => {
  let component: RegistroPasoCuatroComponent;
  let fixture: ComponentFixture<RegistroPasoCuatroComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistroPasoCuatroComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegistroPasoCuatroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
