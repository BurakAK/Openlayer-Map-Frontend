/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { KapiService } from './kapi.service';

describe('Service: Kapi', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [KapiService]
    });
  });

  it('should ...', inject([KapiService], (service: KapiService) => {
    expect(service).toBeTruthy();
  }));
});
