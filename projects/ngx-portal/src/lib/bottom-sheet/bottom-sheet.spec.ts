import { TestBed } from '@angular/core/testing';
import { BottomSheet } from './bottom-sheet';

describe('BottomSheet', () => {
  let service: BottomSheet;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BottomSheet);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // Test: open bottom sheet
  // Test: dismiss bottom sheet
  // Test: multiple bottom sheets
  // Test: backdrop interaction
});
