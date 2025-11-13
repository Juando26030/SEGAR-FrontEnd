import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { ConfiguracionComponent } from './configuracion.component';

describe('ConfiguracionComponent', () => {
  let component: ConfiguracionComponent = null as any;
  let fixture: ComponentFixture<ConfiguracionComponent> = null as any;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfiguracionComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfiguracionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
