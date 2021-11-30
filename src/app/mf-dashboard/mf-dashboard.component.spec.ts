import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MfDashboardComponent } from './mf-dashboard.component';

describe('MfDashboardComponent', () => {
  let component: MfDashboardComponent;
  let fixture: ComponentFixture<MfDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MfDashboardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MfDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
