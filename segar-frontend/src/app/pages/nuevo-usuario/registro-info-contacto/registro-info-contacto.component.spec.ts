import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroup, FormControl } from '@angular/forms';

import { RegistroInfoContactoComponent } from './registro-info-contacto.component';

describe('RegistroInfoContactoComponent', () => {
  let component: RegistroInfoContactoComponent = null as any;
  let fixture: ComponentFixture<RegistroInfoContactoComponent> = null as any;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistroInfoContactoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegistroInfoContactoComponent);
    component = fixture.componentInstance;
    
    // Mock del FormGroup que el componente espera como @Input
    component.form = new FormGroup({
      email: new FormControl(''),
      confirmEmail: new FormControl(''),
      phone: new FormControl(''),
      altPhone: new FormControl(''),
      address: new FormControl(''),
      city: new FormControl(''),
      postalCode: new FormControl('')
    });
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
