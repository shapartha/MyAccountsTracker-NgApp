import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageEqComponent } from './manage-eq.component';

describe('ManageEqComponent', () => {
  let component: ManageEqComponent;
  let fixture: ComponentFixture<ManageEqComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManageEqComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageEqComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
