import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BusquedaGlobalComponent } from './busqueda-global.component';

describe('BusquedaGlobalComponent', () => {
  let component: BusquedaGlobalComponent = null as any;
  let fixture: ComponentFixture<BusquedaGlobalComponent> = null as any;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BusquedaGlobalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BusquedaGlobalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
