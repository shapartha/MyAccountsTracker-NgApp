import { TestBed } from '@angular/core/testing';

import { RouterDataExchangeService } from './router-data-exchange.service';

describe('RouterDataExchangeService', () => {
  let service: RouterDataExchangeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RouterDataExchangeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
