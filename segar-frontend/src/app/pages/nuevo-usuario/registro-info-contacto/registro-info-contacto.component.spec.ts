import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistroInfoContactoComponent } from './registro-info-contacto.component';

describe('RegistroInfoContactoComponent', () => {
  let component: RegistroInfoContactoComponent = null as any;
  let fixture: ComponentFixture<RegistroInfoContactoComponent> = null as any;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistroInfoContactoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegistroInfoContactoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
