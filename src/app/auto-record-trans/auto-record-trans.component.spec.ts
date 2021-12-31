import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AutoRecordTransComponent } from './auto-record-trans.component';

describe('AutoRecordTransComponent', () => {
  let component: AutoRecordTransComponent;
  let fixture: ComponentFixture<AutoRecordTransComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AutoRecordTransComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AutoRecordTransComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
