import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecoverFormComponent } from './recover-form.component';

describe('RecoverFormComponent', () => {
  let component: RecoverFormComponent = null as any;
  let fixture: ComponentFixture<RecoverFormComponent> = null as any;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecoverFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecoverFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
