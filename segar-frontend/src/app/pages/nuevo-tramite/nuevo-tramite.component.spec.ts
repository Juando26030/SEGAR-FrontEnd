import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NuevoTramiteComponent } from './nuevo-tramite.component';

describe('NuevoTramiteComponent', () => {
  let component: NuevoTramiteComponent = null as any;
  let fixture: ComponentFixture<NuevoTramiteComponent> = null as any;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NuevoTramiteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NuevoTramiteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
