import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroup, FormControl } from '@angular/forms';

import { RegistroInfoCuentaComponent } from './registro-info-cuenta.component';

describe('RegistroInfoCuentaComponent', () => {
  let component: RegistroInfoCuentaComponent = null as any;
  let fixture: ComponentFixture<RegistroInfoCuentaComponent> = null as any;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistroInfoCuentaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegistroInfoCuentaComponent);
    component = fixture.componentInstance;
        
    // Mock del FormGroup que el componente espera como @Input
    component.form = new FormGroup({
      username: new FormControl(''),
      role: new FormControl(''),
      password: new FormControl(''),
      confirmPassword: new FormControl('')
    });
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
