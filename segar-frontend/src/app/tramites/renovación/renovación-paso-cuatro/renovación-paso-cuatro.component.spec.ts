import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RenovaciNPasoCuatroComponent } from './renovación-paso-cuatro.component';

describe('RenovaciNPasoCuatroComponent', () => {
  let component: RenovaciNPasoCuatroComponent;
  let fixture: ComponentFixture<RenovaciNPasoCuatroComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RenovaciNPasoCuatroComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RenovaciNPasoCuatroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
