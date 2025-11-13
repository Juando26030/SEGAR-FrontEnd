import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthPageComponent } from './auth-page.component';

describe('AuthPageComponent', () => {
  let component: AuthPageComponent = null as any;
  let fixture: ComponentFixture<AuthPageComponent> = null as any;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuthPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
