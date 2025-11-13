import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserStatCardComponent } from './user-stat-card.component';

describe('UserStatCardComponent', () => {
  let component: UserStatCardComponent = null as any;
  let fixture: ComponentFixture<UserStatCardComponent> = null as any;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserStatCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserStatCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
