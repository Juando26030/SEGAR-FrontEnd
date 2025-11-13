import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { NuevoProductoComponent } from './nuevo-producto.component';

describe('NuevoProductoComponent', () => {
  let component: NuevoProductoComponent = null as any;
  let fixture: ComponentFixture<NuevoProductoComponent> = null as any;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NuevoProductoComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NuevoProductoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
