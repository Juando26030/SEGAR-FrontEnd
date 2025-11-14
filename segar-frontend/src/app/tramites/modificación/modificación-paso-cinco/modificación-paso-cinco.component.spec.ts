import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RenovaciNPasoCincoComponent } from './modificación-paso-cinco.component';

describe('RenovaciNPasoCincoComponent', () => {
  let component: RenovaciNPasoCincoComponent;
  let fixture: ComponentFixture<RenovaciNPasoCincoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RenovaciNPasoCincoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RenovaciNPasoCincoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
