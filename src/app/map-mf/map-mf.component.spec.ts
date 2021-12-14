import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapMfComponent } from './map-mf.component';

describe('MapMfComponent', () => {
  let component: MapMfComponent;
  let fixture: ComponentFixture<MapMfComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MapMfComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MapMfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
