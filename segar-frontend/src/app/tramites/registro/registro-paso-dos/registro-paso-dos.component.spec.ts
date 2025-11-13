import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistroPasoDosComponent } from './registro-paso-dos.component';

describe('RegistroPasoDosComponent', () => {
  let component: RegistroPasoDosComponent = null as any;
  let fixture: ComponentFixture<RegistroPasoDosComponent> = null as any;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistroPasoDosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegistroPasoDosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
