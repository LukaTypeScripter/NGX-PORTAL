import { TestBed } from '@angular/core/testing';
import { BottomSheetSnapService } from './bottom-sheet-snap.service';

describe('BottomSheetSnapService', () => {
  let service: BottomSheetSnapService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BottomSheetSnapService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // Test: calculate nearest snap point
  // Test: snap point with velocity
  // Test: percentage-based snap points
  // Test: pixel-based snap points
  // Test: mixed snap point types
});
