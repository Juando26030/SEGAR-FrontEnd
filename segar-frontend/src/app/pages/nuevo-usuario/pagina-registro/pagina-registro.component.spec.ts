import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaginaRegistroComponent } from './pagina-registro.component';

describe('PaginaRegistroComponent', () => {
  let component: PaginaRegistroComponent = null as any;
  let fixture: ComponentFixture<PaginaRegistroComponent> = null as any;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaginaRegistroComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaginaRegistroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
