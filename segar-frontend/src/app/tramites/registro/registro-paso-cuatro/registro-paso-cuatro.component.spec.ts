import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroup, FormControl } from '@angular/forms';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { RegistroPasoCuatroComponent } from './registro-paso-cuatro.component';

describe('RegistroPasoCuatroComponent', () => {
  let component: RegistroPasoCuatroComponent = null as any;
  let fixture: ComponentFixture<RegistroPasoCuatroComponent> = null as any;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistroPasoCuatroComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegistroPasoCuatroComponent);
    component = fixture.componentInstance;
        
    // Mock del FormGroup que el componente espera como @Input
    component.form = new FormGroup({
      campo1: new FormControl(''),
      campo2: new FormControl('')
    });
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
