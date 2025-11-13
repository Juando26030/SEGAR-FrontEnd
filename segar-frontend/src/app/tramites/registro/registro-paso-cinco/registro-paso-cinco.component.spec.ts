import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistroPasoCincoComponent } from './registro-paso-cinco.component';

describe('RegistroPasoCincoComponent', () => {
  let component: RegistroPasoCincoComponent = null as any;
  let fixture: ComponentFixture<RegistroPasoCincoComponent> = null as any;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistroPasoCincoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegistroPasoCincoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
