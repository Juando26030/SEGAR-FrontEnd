import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserTableComponent } from './user-table.component';

describe('UserTableComponent', () => {
  let component: UserTableComponent = null as any;
  let fixture: ComponentFixture<UserTableComponent> = null as any;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
