import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelPrincipalComponent } from './panel-principal.component';

describe('PanelPrincipalComponent', () => {
  let component: PanelPrincipalComponent = null as any;
  let fixture: ComponentFixture<PanelPrincipalComponent> = null as any;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PanelPrincipalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PanelPrincipalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
