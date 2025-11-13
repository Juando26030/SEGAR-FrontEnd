import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { ProductosComponent } from './productos.component';
import { AuthService } from '../../auth/services/auth.service';

describe('ProductosComponent', () => {
  let component: ProductosComponent = null as any;
  let fixture: ComponentFixture<ProductosComponent> = null as any;
  let mockAuthService: jest.Mocked<AuthService> = null as any;
  let mockRouter: jest.Mocked<Partial<Router>> = null as any;

  beforeEach(async () => {
    mockAuthService = {
      getToken: jest.fn().mockReturnValue('fake-token')
    } as any;
    
    mockRouter = {
      navigate: jest.fn()
    } as any;

    await TestBed.configureTestingModule({
      imports: [ProductosComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductosComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
