import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeRecurringSectionComponent } from './home-recurring-section.component';

describe('HomeRecurringSectionComponent', () => {
  let component: HomeRecurringSectionComponent;
  let fixture: ComponentFixture<HomeRecurringSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HomeRecurringSectionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeRecurringSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
