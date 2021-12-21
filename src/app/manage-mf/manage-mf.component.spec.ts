import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageMfComponent } from './manage-mf.component';

describe('ManageMfComponent', () => {
  let component: ManageMfComponent;
  let fixture: ComponentFixture<ManageMfComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManageMfComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageMfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
