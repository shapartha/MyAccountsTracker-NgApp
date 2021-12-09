import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeScheduledSectionComponent } from './home-scheduled-section.component';

describe('HomeScheduledSectionComponent', () => {
  let component: HomeScheduledSectionComponent;
  let fixture: ComponentFixture<HomeScheduledSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HomeScheduledSectionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeScheduledSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
