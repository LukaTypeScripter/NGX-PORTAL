import { TestBed } from '@angular/core/testing';

import { DropDownStackManager } from './drop-down-stack-manager';

describe('DropDownStackManager', () => {
  let service: DropDownStackManager;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DropDownStackManager);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
