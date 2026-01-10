import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { BottomSheetGestureService } from './bottom-sheet-gesture.service';
import { BottomSheetRef } from '../bottom-sheet-ref';
import { OverlayRef } from '@angular/cdk/overlay';

describe('BottomSheetGestureService', () => {
  let service: BottomSheetGestureService;
  let mockBottomSheetRef: BottomSheetRef<any, any>;
  let mockOverlayRef: any;
  let mockDragHandle: HTMLElement;
  let mockOverlayElement: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BottomSheetGestureService);

    mockOverlayElement = document.createElement('div');
    mockOverlayElement.style.position = 'fixed';
    mockOverlayElement.style.bottom = '0';
    document.body.appendChild(mockOverlayElement);

    mockDragHandle = document.createElement('div');
    mockDragHandle.className = 'drag-handle';
    mockOverlayElement.appendChild(mockDragHandle);

    if (!mockDragHandle.setPointerCapture) {
      (mockDragHandle as any).setPointerCapture = vi.fn();
    }
    if (!mockDragHandle.releasePointerCapture) {
      (mockDragHandle as any).releasePointerCapture = vi.fn();
    }
    if (!mockDragHandle.hasPointerCapture) {
      (mockDragHandle as any).hasPointerCapture = vi.fn().mockReturnValue(true);
    }

    mockOverlayRef = {
      overlayElement: mockOverlayElement,
      dispose: vi.fn(),
    } as any;

    mockBottomSheetRef = {
      overlayRef: mockOverlayRef,
    } as any;
  });

  afterEach(() => {
    if (mockOverlayElement.parentNode) {
      document.body.removeChild(mockOverlayElement);
    }
    document.body.style.userSelect = '';
    document.body.style.touchAction = '';
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('enableGestures', () => {
    it('should set up gesture state for bottom sheet', () => {
      service.enableGestures(mockBottomSheetRef, mockDragHandle);

      expect(service.isDragging(mockBottomSheetRef)).toBe(false);
    });

    it('should add event listeners to drag handle', () => {
      const spy = vi.spyOn(mockDragHandle, 'addEventListener');

      service.enableGestures(mockBottomSheetRef, mockDragHandle);

      expect(spy).toHaveBeenCalledWith('pointerdown', expect.any(Function));
      expect(spy).toHaveBeenCalledWith('pointermove', expect.any(Function));
      expect(spy).toHaveBeenCalledWith('pointerup', expect.any(Function));
      expect(spy).toHaveBeenCalledWith('pointercancel', expect.any(Function));
    });

    it('should call onDragStart callback when drag starts', () => {
      const onDragStart = vi.fn();

      service.enableGestures(mockBottomSheetRef, mockDragHandle, onDragStart);

      const pointerDownEvent = new PointerEvent('pointerdown', {
        isPrimary: true,
        clientY: 100,
        pointerId: 1,
      });

      mockDragHandle.dispatchEvent(pointerDownEvent);

      expect(onDragStart).toHaveBeenCalled();
    });

    it('should call onDragMove callback during drag', () => {
      const onDragMove = vi.fn();

      service.enableGestures(mockBottomSheetRef, mockDragHandle, undefined, onDragMove);

      const pointerDownEvent = new PointerEvent('pointerdown', {
        isPrimary: true,
        clientY: 100,
        pointerId: 1,
      });
      mockDragHandle.dispatchEvent(pointerDownEvent);

      const pointerMoveEvent = new PointerEvent('pointermove', {
        isPrimary: true,
        clientY: 150,
        pointerId: 1,
      });
      mockDragHandle.dispatchEvent(pointerMoveEvent);

      expect(onDragMove).toHaveBeenCalledWith(50, 150);
    });

    it('should call onDragEnd callback when drag ends', () => {
      const onDragEnd = vi.fn();

      service.enableGestures(mockBottomSheetRef, mockDragHandle, undefined, undefined, onDragEnd);

      const pointerDownEvent = new PointerEvent('pointerdown', {
        isPrimary: true,
        clientY: 100,
        pointerId: 1,
      });
      mockDragHandle.dispatchEvent(pointerDownEvent);

      const pointerMoveEvent = new PointerEvent('pointermove', {
        isPrimary: true,
        clientY: 150,
        pointerId: 1,
      });
      mockDragHandle.dispatchEvent(pointerMoveEvent);

      const pointerUpEvent = new PointerEvent('pointerup', {
        isPrimary: true,
        clientY: 150,
        pointerId: 1,
      });
      mockDragHandle.dispatchEvent(pointerUpEvent);

      expect(onDragEnd).toHaveBeenCalledWith(expect.any(Number), 50);
    });

    it('should set body styles during drag', () => {
      service.enableGestures(mockBottomSheetRef, mockDragHandle);

      const pointerDownEvent = new PointerEvent('pointerdown', {
        isPrimary: true,
        clientY: 100,
        pointerId: 1,
      });
      mockDragHandle.dispatchEvent(pointerDownEvent);

      expect(document.body.style.userSelect).toBe('none');
      expect(document.body.style.touchAction).toBe('none');
    });

    it('should reset body styles after drag ends', () => {
      service.enableGestures(mockBottomSheetRef, mockDragHandle);

      const pointerDownEvent = new PointerEvent('pointerdown', {
        isPrimary: true,
        clientY: 100,
        pointerId: 1,
      });
      mockDragHandle.dispatchEvent(pointerDownEvent);

      const pointerUpEvent = new PointerEvent('pointerup', {
        isPrimary: true,
        clientY: 150,
        pointerId: 1,
      });
      mockDragHandle.dispatchEvent(pointerUpEvent);

      expect(document.body.style.userSelect).toBe('');
      expect(document.body.style.touchAction).toBe('');
    });

    it('should ignore non-primary pointer events', () => {
      const onDragStart = vi.fn();

      service.enableGestures(mockBottomSheetRef, mockDragHandle, onDragStart);

      const nonPrimaryEvent = new PointerEvent('pointerdown', {
        isPrimary: false,
        clientY: 100,
        pointerId: 2,
      });
      mockDragHandle.dispatchEvent(nonPrimaryEvent);

      expect(onDragStart).not.toHaveBeenCalled();
    });

    it('should ignore pointer down outside drag handle', () => {
      const onDragStart = vi.fn();
      const outsideElement = document.createElement('div');
      document.body.appendChild(outsideElement);

      service.enableGestures(mockBottomSheetRef, mockDragHandle, onDragStart);

      const pointerDownEvent = new PointerEvent('pointerdown', {
        isPrimary: true,
        clientY: 100,
        pointerId: 1,
        bubbles: true,
      });
      Object.defineProperty(pointerDownEvent, 'target', {
        value: outsideElement,
        enumerable: true,
      });

      mockDragHandle.dispatchEvent(pointerDownEvent);

      expect(onDragStart).not.toHaveBeenCalled();
      document.body.removeChild(outsideElement);
    });

    it('should track position history during drag', () => {
      const onDragEnd = vi.fn();

      service.enableGestures(mockBottomSheetRef, mockDragHandle, undefined, undefined, onDragEnd);

      const pointerDownEvent = new PointerEvent('pointerdown', {
        isPrimary: true,
        clientY: 100,
        pointerId: 1,
      });
      mockDragHandle.dispatchEvent(pointerDownEvent);

      for (let i = 0; i < 5; i++) {
        const pointerMoveEvent = new PointerEvent('pointermove', {
          isPrimary: true,
          clientY: 100 + i * 10,
          pointerId: 1,
        });
        mockDragHandle.dispatchEvent(pointerMoveEvent);
      }

      const pointerUpEvent = new PointerEvent('pointerup', {
        isPrimary: true,
        clientY: 150,
        pointerId: 1,
      });
      mockDragHandle.dispatchEvent(pointerUpEvent);

      expect(onDragEnd).toHaveBeenCalled();
      const velocity = onDragEnd.mock.calls[0][0];
      expect(typeof velocity).toBe('number');
    });

    it('should handle pointer cancel event', () => {
      service.enableGestures(mockBottomSheetRef, mockDragHandle);

      const pointerDownEvent = new PointerEvent('pointerdown', {
        isPrimary: true,
        clientY: 100,
        pointerId: 1,
      });
      mockDragHandle.dispatchEvent(pointerDownEvent);

      expect(service.isDragging(mockBottomSheetRef)).toBe(true);

      const pointerCancelEvent = new PointerEvent('pointercancel', {
        isPrimary: true,
        pointerId: 1,
      });
      mockDragHandle.dispatchEvent(pointerCancelEvent);

      expect(service.isDragging(mockBottomSheetRef)).toBe(false);
      expect(document.body.style.userSelect).toBe('');
      expect(document.body.style.touchAction).toBe('');
    });
  });

  describe('disableGestures', () => {
    it('should remove event listeners from drag handle', () => {
      const spy = vi.spyOn(mockDragHandle, 'removeEventListener');

      service.enableGestures(mockBottomSheetRef, mockDragHandle);
      service.disableGestures(mockBottomSheetRef, mockDragHandle);

      expect(spy).toHaveBeenCalledWith('pointerdown', expect.any(Function));
      expect(spy).toHaveBeenCalledWith('pointermove', expect.any(Function));
      expect(spy).toHaveBeenCalledWith('pointerup', expect.any(Function));
      expect(spy).toHaveBeenCalledWith('pointercancel', expect.any(Function));
    });

    it('should remove gesture state', () => {
      service.enableGestures(mockBottomSheetRef, mockDragHandle);
      expect(service.isDragging(mockBottomSheetRef)).toBe(false);

      service.disableGestures(mockBottomSheetRef, mockDragHandle);

      expect(service.isDragging(mockBottomSheetRef)).toBe(false);
    });

    it('should reset body styles', () => {
      service.enableGestures(mockBottomSheetRef, mockDragHandle);

      const pointerDownEvent = new PointerEvent('pointerdown', {
        isPrimary: true,
        clientY: 100,
        pointerId: 1,
      });
      mockDragHandle.dispatchEvent(pointerDownEvent);

      document.body.style.userSelect = 'none';
      document.body.style.touchAction = 'none';

      service.disableGestures(mockBottomSheetRef, mockDragHandle);

      expect(document.body.style.userSelect).toBe('');
      expect(document.body.style.touchAction).toBe('');
    });

    it('should handle disabling when not enabled', () => {
      expect(() => {
        service.disableGestures(mockBottomSheetRef, mockDragHandle);
      }).not.toThrow();
    });
  });

  describe('isDragging', () => {
    it('should return false when not dragging', () => {
      service.enableGestures(mockBottomSheetRef, mockDragHandle);

      expect(service.isDragging(mockBottomSheetRef)).toBe(false);
    });

    it('should return true during drag', () => {
      service.enableGestures(mockBottomSheetRef, mockDragHandle);

      const pointerDownEvent = new PointerEvent('pointerdown', {
        isPrimary: true,
        clientY: 100,
        pointerId: 1,
      });
      mockDragHandle.dispatchEvent(pointerDownEvent);

      expect(service.isDragging(mockBottomSheetRef)).toBe(true);
    });

    it('should return false after drag ends', () => {
      service.enableGestures(mockBottomSheetRef, mockDragHandle);

      const pointerDownEvent = new PointerEvent('pointerdown', {
        isPrimary: true,
        clientY: 100,
        pointerId: 1,
      });
      mockDragHandle.dispatchEvent(pointerDownEvent);

      const pointerUpEvent = new PointerEvent('pointerup', {
        isPrimary: true,
        clientY: 150,
        pointerId: 1,
      });
      mockDragHandle.dispatchEvent(pointerUpEvent);

      expect(service.isDragging(mockBottomSheetRef)).toBe(false);
    });

    it('should return false for unknown bottom sheet ref', () => {
      const unknownRef = {} as BottomSheetRef<any, any>;

      expect(service.isDragging(unknownRef)).toBe(false);
    });
  });

  describe('isSwipe', () => {
    it('should return false for velocity below threshold', () => {
      const result = service.isSwipe(0.3, 0.5);

      expect(result.isSwipe).toBe(false);
      expect(result.direction).toBe(null);
    });

    it('should detect downward swipe', () => {
      const result = service.isSwipe(0.8, 0.5);

      expect(result.isSwipe).toBe(true);
      expect(result.direction).toBe('down');
    });

    it('should detect upward swipe', () => {
      const result = service.isSwipe(-0.8, 0.5);

      expect(result.isSwipe).toBe(true);
      expect(result.direction).toBe('up');
    });

    it('should use default threshold when not provided', () => {
      const result = service.isSwipe(0.6);

      expect(result.isSwipe).toBe(true);
    });

    it('should handle zero velocity', () => {
      const result = service.isSwipe(0);

      expect(result.isSwipe).toBe(false);
      expect(result.direction).toBe(null);
    });

    it('should handle negative threshold', () => {
      const result = service.isSwipe(-1.0, 0.5);

      expect(result.isSwipe).toBe(true);
      expect(result.direction).toBe('up');
    });

    it('should detect swipe at exact threshold', () => {
      const result = service.isSwipe(0.5, 0.5);

      expect(result.isSwipe).toBe(true);
    });
  });

  describe('velocity calculation', () => {
    it('should calculate positive velocity for downward movement', async () => {
      const onDragEnd = vi.fn();

      service.enableGestures(mockBottomSheetRef, mockDragHandle, undefined, undefined, onDragEnd);

      const pointerDownEvent = new PointerEvent('pointerdown', {
        isPrimary: true,
        clientY: 100,
        pointerId: 1,
      });
      mockDragHandle.dispatchEvent(pointerDownEvent);

      await new Promise((resolve) => setTimeout(resolve, 50));

      const pointerMoveEvent = new PointerEvent('pointermove', {
        isPrimary: true,
        clientY: 200,
        pointerId: 1,
      });
      mockDragHandle.dispatchEvent(pointerMoveEvent);

      const pointerUpEvent = new PointerEvent('pointerup', {
        isPrimary: true,
        clientY: 200,
        pointerId: 1,
      });
      mockDragHandle.dispatchEvent(pointerUpEvent);

      const velocity = onDragEnd.mock.calls[0][0];
      expect(velocity).toBeGreaterThan(0);
    });

    it('should calculate negative velocity for upward movement', async () => {
      const onDragEnd = vi.fn();

      service.enableGestures(mockBottomSheetRef, mockDragHandle, undefined, undefined, onDragEnd);

      const pointerDownEvent = new PointerEvent('pointerdown', {
        isPrimary: true,
        clientY: 200,
        pointerId: 1,
      });
      mockDragHandle.dispatchEvent(pointerDownEvent);

      await new Promise((resolve) => setTimeout(resolve, 50));

      const pointerMoveEvent = new PointerEvent('pointermove', {
        isPrimary: true,
        clientY: 100,
        pointerId: 1,
      });
      mockDragHandle.dispatchEvent(pointerMoveEvent);

      const pointerUpEvent = new PointerEvent('pointerup', {
        isPrimary: true,
        clientY: 100,
        pointerId: 1,
      });
      mockDragHandle.dispatchEvent(pointerUpEvent);

      const velocity = onDragEnd.mock.calls[0][0];
      expect(velocity).toBeLessThan(0);
    });

    it('should return zero velocity for no movement', () => {
      const onDragEnd = vi.fn();

      service.enableGestures(mockBottomSheetRef, mockDragHandle, undefined, undefined, onDragEnd);

      const pointerDownEvent = new PointerEvent('pointerdown', {
        isPrimary: true,
        clientY: 100,
        pointerId: 1,
      });
      mockDragHandle.dispatchEvent(pointerDownEvent);

      const pointerUpEvent = new PointerEvent('pointerup', {
        isPrimary: true,
        clientY: 100,
        pointerId: 1,
      });
      mockDragHandle.dispatchEvent(pointerUpEvent);

      const velocity = onDragEnd.mock.calls[0][0];
      expect(velocity).toBe(0);
    });
  });

  describe('position history', () => {
    it('should limit position history size', () => {
      const onDragEnd = vi.fn();

      service.enableGestures(mockBottomSheetRef, mockDragHandle, undefined, undefined, onDragEnd);

      const pointerDownEvent = new PointerEvent('pointerdown', {
        isPrimary: true,
        clientY: 100,
        pointerId: 1,
      });
      mockDragHandle.dispatchEvent(pointerDownEvent);

      for (let i = 0; i < 20; i++) {
        const pointerMoveEvent = new PointerEvent('pointermove', {
          isPrimary: true,
          clientY: 100 + i,
          pointerId: 1,
        });
        mockDragHandle.dispatchEvent(pointerMoveEvent);
      }

      const pointerUpEvent = new PointerEvent('pointerup', {
        isPrimary: true,
        clientY: 120,
        pointerId: 1,
      });
      mockDragHandle.dispatchEvent(pointerUpEvent);

      expect(onDragEnd).toHaveBeenCalled();
    });

    it('should clear position history after drag ends', () => {
      service.enableGestures(mockBottomSheetRef, mockDragHandle);

      const pointerDownEvent = new PointerEvent('pointerdown', {
        isPrimary: true,
        clientY: 100,
        pointerId: 1,
      });
      mockDragHandle.dispatchEvent(pointerDownEvent);

      const pointerMoveEvent = new PointerEvent('pointermove', {
        isPrimary: true,
        clientY: 150,
        pointerId: 1,
      });
      mockDragHandle.dispatchEvent(pointerMoveEvent);

      const pointerUpEvent = new PointerEvent('pointerup', {
        isPrimary: true,
        clientY: 150,
        pointerId: 1,
      });
      mockDragHandle.dispatchEvent(pointerUpEvent);

      expect(service.isDragging(mockBottomSheetRef)).toBe(false);
    });
  });
});
