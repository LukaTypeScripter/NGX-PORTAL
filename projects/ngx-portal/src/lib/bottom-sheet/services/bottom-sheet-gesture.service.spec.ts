import { TestBed } from '@angular/core/testing';
import { BottomSheetGestureService } from './bottom-sheet-gesture.service';

describe('BottomSheetGestureService', () => {
  let service: BottomSheetGestureService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BottomSheetGestureService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // Test: track drag start
  // Test: calculate velocity
  // Test: determine snap point from velocity
  // Test: handle touch events
  // Test: handle mouse events
});
