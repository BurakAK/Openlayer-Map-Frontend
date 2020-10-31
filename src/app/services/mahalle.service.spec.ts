/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { MahalleService } from './mahalle.service';

describe('Service: Mahalle', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MahalleService]
    });
  });

  it('should ...', inject([MahalleService], (service: MahalleService) => {
    expect(service).toBeTruthy();
  }));
});
