import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecurringTransComponent } from './recurring-trans.component';

describe('RecurringTransComponent', () => {
  let component: RecurringTransComponent;
  let fixture: ComponentFixture<RecurringTransComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RecurringTransComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RecurringTransComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
