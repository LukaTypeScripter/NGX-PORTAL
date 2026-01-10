import { TestBed } from '@angular/core/testing';
import { BottomSheetSnapService } from './bottom-sheet-snap.service';
import { SnapPoint } from '../bottom-sheet-config';

describe('BottomSheetSnapService', () => {
  let service: BottomSheetSnapService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BottomSheetSnapService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('parseSnapPoints', () => {
    it('should parse percentage numbers (0-1)', () => {
      const snapPoints: SnapPoint[] = [0.3, 0.6, 0.9];
      const containerHeight = 1000;
      const parsed = service.parseSnapPoints(snapPoints, containerHeight);

      expect(parsed).toHaveLength(3);
      expect(parsed[0].value).toBe(300);
      expect(parsed[1].value).toBe(600);
      expect(parsed[2].value).toBe(900);
    });

    it('should parse pixel numbers (>1)', () => {
      const snapPoints: SnapPoint[] = [300, 600, 900];
      const containerHeight = 1000;
      const parsed = service.parseSnapPoints(snapPoints, containerHeight);

      expect(parsed).toHaveLength(3);
      expect(parsed[0].value).toBe(300);
      expect(parsed[1].value).toBe(600);
      expect(parsed[2].value).toBe(900);
    });

    it('should parse percentage strings', () => {
      const snapPoints: SnapPoint[] = ['30%', '60%', '90%'];
      const containerHeight = 1000;
      const parsed = service.parseSnapPoints(snapPoints, containerHeight);

      expect(parsed).toHaveLength(3);
      expect(parsed[0].value).toBe(300);
      expect(parsed[1].value).toBe(600);
      expect(parsed[2].value).toBe(900);
    });

    it('should parse pixel strings', () => {
      const snapPoints: SnapPoint[] = ['300px', '600px', '900px'];
      const containerHeight = 1000;
      const parsed = service.parseSnapPoints(snapPoints, containerHeight);

      expect(parsed).toHaveLength(3);
      expect(parsed[0].value).toBe(300);
      expect(parsed[1].value).toBe(600);
      expect(parsed[2].value).toBe(900);
    });

    it('should parse vh strings', () => {
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 1000,
      });

      const snapPoints: SnapPoint[] = ['30vh', '60vh', '90vh'];
      const containerHeight = 1000;
      const parsed = service.parseSnapPoints(snapPoints, containerHeight);

      expect(parsed).toHaveLength(3);
      expect(parsed[0].value).toBe(300);
      expect(parsed[1].value).toBe(600);
      expect(parsed[2].value).toBe(900);
    });

    it('should parse mixed snap point types', () => {
      const snapPoints: SnapPoint[] = [0.3, '60%', '900px'];
      const containerHeight = 1000;
      const parsed = service.parseSnapPoints(snapPoints, containerHeight);

      expect(parsed).toHaveLength(3);
      expect(parsed[0].value).toBe(300);
      expect(parsed[1].value).toBe(600);
      expect(parsed[2].value).toBe(900);
    });

    it('should sort snap points by value ascending', () => {
      const snapPoints: SnapPoint[] = [0.9, 0.3, 0.6];
      const containerHeight = 1000;
      const parsed = service.parseSnapPoints(snapPoints, containerHeight);

      expect(parsed).toHaveLength(3);
      expect(parsed[0].value).toBe(300);
      expect(parsed[1].value).toBe(600);
      expect(parsed[2].value).toBe(900);
    });

    it('should preserve original indices after sorting', () => {
      const snapPoints: SnapPoint[] = [0.9, 0.3, 0.6];
      const containerHeight = 1000;
      const parsed = service.parseSnapPoints(snapPoints, containerHeight);

      expect(parsed[0].index).toBe(1);
      expect(parsed[1].index).toBe(2);
      expect(parsed[2].index).toBe(0);
    });

    it('should default to 50% for invalid string values', () => {
      const snapPoints: SnapPoint[] = ['invalid'];
      const containerHeight = 1000;
      const parsed = service.parseSnapPoints(snapPoints, containerHeight);

      expect(parsed[0].value).toBe(500);
    });
  });

  describe('determineTargetSnapPoint', () => {
    const createParsedSnapPoints = () => [
      { value: 300, index: 0, originalValue: 0.3 },
      { value: 600, index: 1, originalValue: 0.6 },
      { value: 900, index: 2, originalValue: 0.9 },
    ];

    it('should return nearest snap point when velocity is below threshold', () => {
      const snapPoints = createParsedSnapPoints();
      const target = service.determineTargetSnapPoint(550, 0.3, snapPoints, 0.5);

      expect(target?.value).toBe(600);
    });

    it('should return lower snap point when swiping down with high velocity', () => {
      const snapPoints = createParsedSnapPoints();
      const target = service.determineTargetSnapPoint(600, 0.8, snapPoints, 0.5);

      expect(target?.value).toBe(300);
    });

    it('should return higher snap point when swiping up with high velocity', () => {
      const snapPoints = createParsedSnapPoints();
      const target = service.determineTargetSnapPoint(600, -0.8, snapPoints, 0.5);

      expect(target?.value).toBe(900);
    });

    it('should return null when swiping down from lowest snap point', () => {
      const snapPoints = createParsedSnapPoints();
      const target = service.determineTargetSnapPoint(300, 0.8, snapPoints, 0.5);

      expect(target).toBeNull();
    });

    it('should return highest snap point when swiping up from highest', () => {
      const snapPoints = createParsedSnapPoints();
      const target = service.determineTargetSnapPoint(900, -0.8, snapPoints, 0.5);

      expect(target?.value).toBe(900);
    });

    it('should return null for empty snap points array', () => {
      const target = service.determineTargetSnapPoint(500, 0, [], 0.5);

      expect(target).toBeNull();
    });

    it('should use custom velocity threshold', () => {
      const snapPoints = createParsedSnapPoints();
      const target = service.determineTargetSnapPoint(600, 0.3, snapPoints, 0.2);

      expect(target?.value).toBe(300);
    });
  });

  describe('shouldDismiss', () => {
    it('should return true when dragged beyond threshold', () => {
      const currentPosition = 400;
      const containerHeight = 1000;
      const dismissThreshold = 0.3;

      const result = service.shouldDismiss(currentPosition, containerHeight, dismissThreshold);

      expect(result).toBe(true);
    });

    it('should return false when dragged below threshold', () => {
      const currentPosition = 200;
      const containerHeight = 1000;
      const dismissThreshold = 0.3;

      const result = service.shouldDismiss(currentPosition, containerHeight, dismissThreshold);

      expect(result).toBe(false);
    });

    it('should use default threshold of 0.3', () => {
      const currentPosition = 350;
      const containerHeight = 1000;

      const result = service.shouldDismiss(currentPosition, containerHeight);

      expect(result).toBe(true);
    });

    it('should work with custom threshold', () => {
      const currentPosition = 400;
      const containerHeight = 1000;
      const dismissThreshold = 0.5;

      const result = service.shouldDismiss(currentPosition, containerHeight, dismissThreshold);

      expect(result).toBe(false);
    });
  });

  describe('getInitialSnapPoint', () => {
    const createParsedSnapPoints = () => [
      { value: 300, index: 0, originalValue: 0.3 },
      { value: 600, index: 1, originalValue: 0.6 },
      { value: 900, index: 2, originalValue: 0.9 },
    ];

    it('should return first snap point by default', () => {
      const snapPoints = createParsedSnapPoints();
      const initial = service.getInitialSnapPoint(snapPoints);

      expect(initial.value).toBe(300);
      expect(initial.index).toBe(0);
    });

    it('should return snap point at specified index', () => {
      const snapPoints = createParsedSnapPoints();
      const initial = service.getInitialSnapPoint(snapPoints, 1);

      expect(initial.value).toBe(600);
      expect(initial.index).toBe(1);
    });

    it('should clamp negative index to 0', () => {
      const snapPoints = createParsedSnapPoints();
      const initial = service.getInitialSnapPoint(snapPoints, -1);

      expect(initial.value).toBe(300);
      expect(initial.index).toBe(0);
    });

    it('should clamp index beyond array length', () => {
      const snapPoints = createParsedSnapPoints();
      const initial = service.getInitialSnapPoint(snapPoints, 10);

      expect(initial.value).toBe(900);
      expect(initial.index).toBe(2);
    });
  });

  describe('calculateSheetPosition', () => {
    it('should calculate correct translateY for snap point', () => {
      const snapPoint = { value: 600, index: 1, originalValue: 0.6 };
      const sheetHeight = 800;

      const translateY = service.calculateSheetPosition(snapPoint, sheetHeight);

      expect(translateY).toBe(200);
    });

    it('should return 0 when sheet height is less than visible height', () => {
      const snapPoint = { value: 600, index: 1, originalValue: 0.6 };
      const sheetHeight = 400;

      const translateY = service.calculateSheetPosition(snapPoint, sheetHeight);

      expect(translateY).toBe(0);
    });

    it('should return 0 when sheet height equals visible height', () => {
      const snapPoint = { value: 600, index: 1, originalValue: 0.6 };
      const sheetHeight = 600;

      const translateY = service.calculateSheetPosition(snapPoint, sheetHeight);

      expect(translateY).toBe(0);
    });

    it('should calculate correct position for tall sheets', () => {
      const snapPoint = { value: 300, index: 0, originalValue: 0.3 };
      const sheetHeight = 1000;

      const translateY = service.calculateSheetPosition(snapPoint, sheetHeight);

      expect(translateY).toBe(700);
    });
  });

  describe('getSnapPointByIndex', () => {
    const createParsedSnapPoints = () => [
      { value: 300, index: 0, originalValue: 0.3 },
      { value: 600, index: 1, originalValue: 0.6 },
      { value: 900, index: 2, originalValue: 0.9 },
    ];

    it('should return snap point at valid index', () => {
      const snapPoints = createParsedSnapPoints();
      const result = service.getSnapPointByIndex(snapPoints, 1);

      expect(result?.value).toBe(600);
      expect(result?.index).toBe(1);
    });

    it('should return null for negative index', () => {
      const snapPoints = createParsedSnapPoints();
      const result = service.getSnapPointByIndex(snapPoints, -1);

      expect(result).toBeNull();
    });

    it('should return null for index beyond array length', () => {
      const snapPoints = createParsedSnapPoints();
      const result = service.getSnapPointByIndex(snapPoints, 10);

      expect(result).toBeNull();
    });

    it('should return first snap point at index 0', () => {
      const snapPoints = createParsedSnapPoints();
      const result = service.getSnapPointByIndex(snapPoints, 0);

      expect(result?.value).toBe(300);
    });

    it('should return last snap point at last index', () => {
      const snapPoints = createParsedSnapPoints();
      const result = service.getSnapPointByIndex(snapPoints, 2);

      expect(result?.value).toBe(900);
    });
  });

  describe('validateSnapPoints', () => {
    it('should validate valid number snap points', () => {
      const snapPoints: SnapPoint[] = [0.3, 0.6, 0.9];
      const result = service.validateSnapPoints(snapPoints);

      expect(result).toBe(true);
    });

    it('should validate valid string snap points', () => {
      const snapPoints: SnapPoint[] = ['30%', '600px', '90vh'];
      const result = service.validateSnapPoints(snapPoints);

      expect(result).toBe(true);
    });

    it('should validate mixed snap points', () => {
      const snapPoints: SnapPoint[] = [0.3, '60%', '900px'];
      const result = service.validateSnapPoints(snapPoints);

      expect(result).toBe(true);
    });

    it('should reject empty array', () => {
      const snapPoints: SnapPoint[] = [];
      const result = service.validateSnapPoints(snapPoints);

      expect(result).toBe(false);
    });

    it('should reject null or undefined', () => {
      const result1 = service.validateSnapPoints(null as any);
      const result2 = service.validateSnapPoints(undefined as any);

      expect(result1).toBe(false);
      expect(result2).toBe(false);
    });

    it('should reject negative numbers', () => {
      const snapPoints: SnapPoint[] = [-0.3, 0.6];
      const result = service.validateSnapPoints(snapPoints);

      expect(result).toBe(false);
    });

    it('should reject invalid string formats', () => {
      const snapPoints: SnapPoint[] = ['invalid', '60%'];
      const result = service.validateSnapPoints(snapPoints);

      expect(result).toBe(false);
    });

    it('should reject non-number, non-string values', () => {
      const snapPoints: SnapPoint[] = [0.3, {} as any];
      const result = service.validateSnapPoints(snapPoints);

      expect(result).toBe(false);
    });

    it('should accept decimal percentages', () => {
      const snapPoints: SnapPoint[] = ['30.5%', '60.75%'];
      const result = service.validateSnapPoints(snapPoints);

      expect(result).toBe(true);
    });

    it('should accept decimal pixels', () => {
      const snapPoints: SnapPoint[] = ['300.5px', '600.75px'];
      const result = service.validateSnapPoints(snapPoints);

      expect(result).toBe(true);
    });
  });

  describe('getSnapPointAtPercentage', () => {
    it('should calculate snap point at percentage', () => {
      const result = service.getSnapPointAtPercentage(0.6, 1000);

      expect(result).toBe(600);
    });

    it('should clamp percentage to 0 minimum', () => {
      const result = service.getSnapPointAtPercentage(-0.5, 1000);

      expect(result).toBe(0);
    });

    it('should clamp percentage to 1 maximum', () => {
      const result = service.getSnapPointAtPercentage(1.5, 1000);

      expect(result).toBe(1000);
    });

    it('should handle 0 percentage', () => {
      const result = service.getSnapPointAtPercentage(0, 1000);

      expect(result).toBe(0);
    });

    it('should handle 100% percentage', () => {
      const result = service.getSnapPointAtPercentage(1, 1000);

      expect(result).toBe(1000);
    });
  });
});
