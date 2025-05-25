import { TestBed } from '@angular/core/testing';

import { SignlaRService } from './signlar.service';

describe('SignlarService', () => {
  let service: SignlaRService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SignlaRService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
