import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserDeleteConfirmComponent } from './user-delete-confirm.component';

describe('UserDeleteConfirmComponent', () => {
  let component: UserDeleteConfirmComponent = null as any;
  let fixture: ComponentFixture<UserDeleteConfirmComponent> = null as any;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserDeleteConfirmComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserDeleteConfirmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
