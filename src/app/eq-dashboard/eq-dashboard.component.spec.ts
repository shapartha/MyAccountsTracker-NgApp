import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EqDashboardComponent } from './eq-dashboard.component';

describe('EqDashboardComponent', () => {
  let component: EqDashboardComponent;
  let fixture: ComponentFixture<EqDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EqDashboardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EqDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
