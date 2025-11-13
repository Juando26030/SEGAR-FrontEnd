import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroup, FormControl } from '@angular/forms';

import { RegistroInfoPersonalComponent } from './registro-info-personal.component';

describe('RegistroInfoPersonalComponent', () => {
  let component: RegistroInfoPersonalComponent = null as any;
  let fixture: ComponentFixture<RegistroInfoPersonalComponent> = null as any;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistroInfoPersonalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegistroInfoPersonalComponent);
    component = fixture.componentInstance;
        
    // Mock del FormGroup que el componente espera como @Input
    component.form = new FormGroup({
      firstName: new FormControl(''),
      lastName: new FormControl(''),
      idType: new FormControl(''),
      idNumber: new FormControl(''),
      birthDate: new FormControl(''),
      gender: new FormControl('')
    });
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
