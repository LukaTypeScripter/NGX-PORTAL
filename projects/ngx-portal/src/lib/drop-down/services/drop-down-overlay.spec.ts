import { TestBed } from '@angular/core/testing';

import { DropDownOverlay } from './drop-down-overlay';

describe('DropDownOverlay', () => {
  let service: DropDownOverlay;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DropDownOverlay);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
