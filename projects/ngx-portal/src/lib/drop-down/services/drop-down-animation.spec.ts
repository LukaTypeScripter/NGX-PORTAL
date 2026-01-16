import { TestBed } from '@angular/core/testing';

import { DropDownAnimation } from './drop-down-animation';

describe('DropDownAnimation', () => {
  let service: DropDownAnimation;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DropDownAnimation);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
