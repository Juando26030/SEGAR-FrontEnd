import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RenovaciNPasoTresComponent } from './renovación-paso-tres.component';

describe('RenovaciNPasoTresComponent', () => {
  let component: RenovaciNPasoTresComponent;
  let fixture: ComponentFixture<RenovaciNPasoTresComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RenovaciNPasoTresComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RenovaciNPasoTresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
