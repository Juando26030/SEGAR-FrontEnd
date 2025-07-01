import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistroInfoContactoComponent } from './registro-info-contacto.component';

describe('RegistroInfoContactoComponent', () => {
  let component: RegistroInfoContactoComponent;
  let fixture: ComponentFixture<RegistroInfoContactoComponent>;

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
