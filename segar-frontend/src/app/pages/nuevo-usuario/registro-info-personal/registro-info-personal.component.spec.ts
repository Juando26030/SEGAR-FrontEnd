import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistroInfoPersonalComponent } from './registro-info-personal.component';

describe('RegistroInfoPersonalComponent', () => {
  let component: RegistroInfoPersonalComponent = null as any;
  let fixture: ComponentFixture<RegistroInfoPersonalComponent> = null as any;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistroInfoPersonalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegistroInfoPersonalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
