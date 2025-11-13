import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { CalendarioComponent } from './calendario.component';

describe('CalendarioComponent', () => {
  let component: CalendarioComponent = null as any;
  let fixture: ComponentFixture<CalendarioComponent> = null as any;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalendarioComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CalendarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
