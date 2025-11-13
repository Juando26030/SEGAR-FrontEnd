import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { UserProfileCardComponent } from './user-profile-card.component';

describe('UserProfileCardComponent', () => {
  let component: UserProfileCardComponent = null as any;
  let fixture: ComponentFixture<UserProfileCardComponent> = null as any;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserProfileCardComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserProfileCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
