import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PendingDeliveryComponent } from './pending-delivery.component';

describe('PendingDeliveryComponent', () => {
  let component: PendingDeliveryComponent;
  let fixture: ComponentFixture<PendingDeliveryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PendingDeliveryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PendingDeliveryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
