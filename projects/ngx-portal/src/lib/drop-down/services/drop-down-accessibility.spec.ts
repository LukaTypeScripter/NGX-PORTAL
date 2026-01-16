import { TestBed } from '@angular/core/testing';

import { DropDownAccessibility } from './drop-down-accessibility';

describe('DropDownAccessibility', () => {
  let service: DropDownAccessibility;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DropDownAccessibility);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
