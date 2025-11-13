import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { PanelPrincipalComponent } from './panel-principal.component';

describe('PanelPrincipalComponent', () => {
  let component: PanelPrincipalComponent = null as any;
  let fixture: ComponentFixture<PanelPrincipalComponent> = null as any;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PanelPrincipalComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PanelPrincipalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
