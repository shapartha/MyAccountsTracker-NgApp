import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapEqComponent } from './map-eq.component';

describe('MapEqComponent', () => {
  let component: MapEqComponent;
  let fixture: ComponentFixture<MapEqComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MapEqComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MapEqComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
