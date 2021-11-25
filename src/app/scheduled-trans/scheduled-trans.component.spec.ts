import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScheduledTransComponent } from './scheduled-trans.component';

describe('ScheduledTransComponent', () => {
  let component: ScheduledTransComponent;
  let fixture: ComponentFixture<ScheduledTransComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ScheduledTransComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ScheduledTransComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
