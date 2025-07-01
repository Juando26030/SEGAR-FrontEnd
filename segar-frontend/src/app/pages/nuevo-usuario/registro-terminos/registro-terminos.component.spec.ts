import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistroTerminosComponent } from './registro-terminos.component';

describe('RegistroTerminosComponent', () => {
  let component: RegistroTerminosComponent;
  let fixture: ComponentFixture<RegistroTerminosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistroTerminosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegistroTerminosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
