import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistroInfoCuentaComponent } from './registro-info-cuenta.component';

describe('RegistroInfoCuentaComponent', () => {
  let component: RegistroInfoCuentaComponent = null as any;
  let fixture: ComponentFixture<RegistroInfoCuentaComponent> = null as any;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistroInfoCuentaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegistroInfoCuentaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
