import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserEditComponent } from './user-edit.component';

describe('UserEditComponent', () => {
  let component: UserEditComponent = null as any;
  let fixture: ComponentFixture<UserEditComponent> = null as any;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserEditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
