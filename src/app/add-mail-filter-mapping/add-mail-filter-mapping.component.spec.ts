import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddMailFilterMappingComponent } from './add-mail-filter-mapping.component';

describe('AddMailFilterMappingComponent', () => {
  let component: AddMailFilterMappingComponent;
  let fixture: ComponentFixture<AddMailFilterMappingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddMailFilterMappingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddMailFilterMappingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
