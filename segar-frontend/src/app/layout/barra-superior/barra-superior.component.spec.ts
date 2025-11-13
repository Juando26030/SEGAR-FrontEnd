import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BarraSuperiorComponent } from './barra-superior.component';

describe('BarraSuperiorComponent', () => {
  let component: BarraSuperiorComponent = null as any;
  let fixture: ComponentFixture<BarraSuperiorComponent> = null as any;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BarraSuperiorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BarraSuperiorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
