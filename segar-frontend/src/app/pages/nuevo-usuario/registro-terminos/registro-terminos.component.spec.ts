import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroup, FormControl } from '@angular/forms';

import { RegistroTerminosComponent } from './registro-terminos.component';

describe('RegistroTerminosComponent', () => {
  let component: RegistroTerminosComponent = null as any;
  let fixture: ComponentFixture<RegistroTerminosComponent> = null as any;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistroTerminosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegistroTerminosComponent);
    component = fixture.componentInstance;
    
    // Mock del FormGroup que el componente espera como @Input
    component.form = new FormGroup({
      termsAccepted: new FormControl(''),
      marketingConsent: new FormControl('')
    });
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
