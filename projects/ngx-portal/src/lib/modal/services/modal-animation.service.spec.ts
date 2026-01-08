import { TestBed } from '@angular/core/testing';
import { ModalAnimationService } from './modal-animation.service';
import { OverlayRef } from '@angular/cdk/overlay';
import { ModalRef } from '../modal-ref';
import { vi } from 'vitest';
import { createModalRefMock } from '../test-helper';

describe('ModalAnimationService', () => {
  let service: ModalAnimationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ModalAnimationService]
    });
    service = TestBed.inject(ModalAnimationService);
  });

  function createMockOverlayRef(): OverlayRef {
    return {
      overlayElement: document.createElement('div'),
      backdropElement: document.createElement('div')
    } as unknown as OverlayRef;
  }

  describe('getDefaultDuration', () => {
    it('should return 300ms as default duration', () => {
      expect(service.getDefaultDuration()).toBe(300);
    });
  });

  describe('applyOpeningAnimation', () => {
    it('should skip animation when disabled', () => {
      const overlayRef = createMockOverlayRef();
      const modalRef = createModalRefMock();
      modalRef.animationEnabled = false;

      service.applyOpeningAnimation(overlayRef, modalRef);

      expect(overlayRef.overlayElement.classList.contains('modal-opening')).toBe(false);
    });

    it('should add opening classes when animation enabled', () => {
      const overlayRef = createMockOverlayRef();
      const modalRef = createModalRefMock();
      modalRef.animationEnabled = true;

      service.applyOpeningAnimation(overlayRef, modalRef);

      expect(overlayRef.overlayElement.classList.contains('modal-opening')).toBe(true);
      expect(overlayRef.backdropElement!.classList.contains('modal-backdrop-opening')).toBe(true);
    });

    it('should set CSS custom property for animation duration', () => {
      const overlayRef = createMockOverlayRef();
      const modalRef = createModalRefMock();
      modalRef.animationEnabled = true;
      modalRef.animationDuration = 500;

      service.applyOpeningAnimation(overlayRef, modalRef);

      expect(overlayRef.overlayElement.style.getPropertyValue('--modal-animation-duration')).toBe('500ms');
      expect(overlayRef.backdropElement!.style.getPropertyValue('--modal-animation-duration')).toBe('500ms');
    });

    it('should transition to opened state after duration', () => {
      vi.useFakeTimers();
      const overlayRef = createMockOverlayRef();
      const modalRef = createModalRefMock();
      modalRef.animationEnabled = true;
      modalRef.animationDuration = 300;

      service.applyOpeningAnimation(overlayRef, modalRef);

      expect(overlayRef.overlayElement.classList.contains('modal-opening')).toBe(true);
      expect(overlayRef.overlayElement.classList.contains('modal-opened')).toBe(false);

      vi.advanceTimersByTime(300);

      expect(overlayRef.overlayElement.classList.contains('modal-opening')).toBe(false);
      expect(overlayRef.overlayElement.classList.contains('modal-opened')).toBe(true);

      vi.useRealTimers();
    });

    it('should transition backdrop to opened state after duration', () => {
      vi.useFakeTimers();
      const overlayRef = createMockOverlayRef();
      const modalRef = createModalRefMock();
      modalRef.animationEnabled = true;
      modalRef.animationDuration = 300;

      service.applyOpeningAnimation(overlayRef, modalRef);

      expect(overlayRef.backdropElement!.classList.contains('modal-backdrop-opening')).toBe(true);
      expect(overlayRef.backdropElement!.classList.contains('modal-backdrop-opened')).toBe(false);

      vi.advanceTimersByTime(300);

      expect(overlayRef.backdropElement!.classList.contains('modal-backdrop-opening')).toBe(false);
      expect(overlayRef.backdropElement!.classList.contains('modal-backdrop-opened')).toBe(true);

      vi.useRealTimers();
    });

    it('should set timeout id on modalRef', () => {
      const overlayRef = createMockOverlayRef();
      const modalRef = createModalRefMock();
      modalRef.animationEnabled = true;

      service.applyOpeningAnimation(overlayRef, modalRef);

      expect(modalRef.openingTimeoutId).toBeDefined();
    });

    it('should clear timeout id after animation completes', () => {
      vi.useFakeTimers();
      const overlayRef = createMockOverlayRef();
      const modalRef = createModalRefMock();
      modalRef.animationEnabled = true;
      modalRef.animationDuration = 300;

      service.applyOpeningAnimation(overlayRef, modalRef);

      expect(modalRef.openingTimeoutId).toBeDefined();

      vi.advanceTimersByTime(300);

      expect(modalRef.openingTimeoutId).toBeUndefined();

      vi.useRealTimers();
    });

    it('should handle missing backdrop element', () => {
      const overlayRef = {
        overlayElement: document.createElement('div'),
        backdropElement: null
      } as unknown as OverlayRef;
      const modalRef = createModalRefMock();
      modalRef.animationEnabled = true;

      expect(() => service.applyOpeningAnimation(overlayRef, modalRef)).not.toThrow();
      expect(overlayRef.overlayElement.classList.contains('modal-opening')).toBe(true);
    });
  });

  describe('applyClosingAnimation', () => {
    it('should call onComplete immediately when animation disabled', () => {
      const overlayRef = createMockOverlayRef();
      const onComplete = vi.fn();

      service.applyClosingAnimation(overlayRef, false, 300, onComplete);

      expect(onComplete).toHaveBeenCalledTimes(1);
    });

    it('should not call onComplete immediately when animation enabled', () => {
      const overlayRef = createMockOverlayRef();
      const onComplete = vi.fn();

      service.applyClosingAnimation(overlayRef, true, 300, onComplete);

      expect(onComplete).not.toHaveBeenCalled();
    });

    it('should add closing classes when animation enabled', () => {
      const overlayRef = createMockOverlayRef();
      const onComplete = vi.fn();

      service.applyClosingAnimation(overlayRef, true, 300, onComplete);

      expect(overlayRef.overlayElement.classList.contains('modal-closing')).toBe(true);
      expect(overlayRef.backdropElement!.classList.contains('modal-backdrop-closing')).toBe(true);
    });

    it('should remove opening and opened classes', () => {
      const overlayRef = createMockOverlayRef();
      overlayRef.overlayElement.classList.add('modal-opening', 'modal-opened');
      overlayRef.backdropElement!.classList.add('modal-backdrop-opening', 'modal-backdrop-opened');
      const onComplete = vi.fn();

      service.applyClosingAnimation(overlayRef, true, 300, onComplete);

      expect(overlayRef.overlayElement.classList.contains('modal-opening')).toBe(false);
      expect(overlayRef.overlayElement.classList.contains('modal-opened')).toBe(false);
      expect(overlayRef.backdropElement!.classList.contains('modal-backdrop-opening')).toBe(false);
      expect(overlayRef.backdropElement!.classList.contains('modal-backdrop-opened')).toBe(false);
    });

    it('should set CSS custom property for animation duration', () => {
      const overlayRef = createMockOverlayRef();
      const onComplete = vi.fn();

      service.applyClosingAnimation(overlayRef, true, 500, onComplete);

      expect(overlayRef.overlayElement.style.getPropertyValue('--modal-animation-duration')).toBe('500ms');
      expect(overlayRef.backdropElement!.style.getPropertyValue('--modal-animation-duration')).toBe('500ms');
    });

    it('should call onComplete after animation duration', () => {
      vi.useFakeTimers();
      const overlayRef = createMockOverlayRef();
      const onComplete = vi.fn();

      service.applyClosingAnimation(overlayRef, true, 300, onComplete);

      expect(onComplete).not.toHaveBeenCalled();

      vi.advanceTimersByTime(300);

      expect(onComplete).toHaveBeenCalledTimes(1);

      vi.useRealTimers();
    });

    it('should handle missing backdrop element', () => {
      const overlayRef = {
        overlayElement: document.createElement('div'),
        backdropElement: null
      } as unknown as OverlayRef;
      const onComplete = vi.fn();

      expect(() => service.applyClosingAnimation(overlayRef, true, 300, onComplete)).not.toThrow();
      expect(overlayRef.overlayElement.classList.contains('modal-closing')).toBe(true);
    });

    it('should handle custom animation durations', () => {
      vi.useFakeTimers();
      const overlayRef = createMockOverlayRef();
      const onComplete = vi.fn();

      service.applyClosingAnimation(overlayRef, true, 1000, onComplete);

      vi.advanceTimersByTime(999);
      expect(onComplete).not.toHaveBeenCalled();

      vi.advanceTimersByTime(1);
      expect(onComplete).toHaveBeenCalledTimes(1);

      vi.useRealTimers();
    });
  });

  describe('animation timing', () => {
    it('should handle very short animation duration', () => {
      vi.useFakeTimers();
      const overlayRef = createMockOverlayRef();
      const modalRef = createModalRefMock();
      modalRef.animationEnabled = true;
      modalRef.animationDuration = 1;

      service.applyOpeningAnimation(overlayRef, modalRef);

      vi.advanceTimersByTime(1);

      expect(overlayRef.overlayElement.classList.contains('modal-opened')).toBe(true);

      vi.useRealTimers();
    });

    it('should handle very long animation duration', () => {
      vi.useFakeTimers();
      const overlayRef = createMockOverlayRef();
      const onComplete = vi.fn();

      service.applyClosingAnimation(overlayRef, true, 5000, onComplete);

      vi.advanceTimersByTime(4999);
      expect(onComplete).not.toHaveBeenCalled();

      vi.advanceTimersByTime(1);
      expect(onComplete).toHaveBeenCalledTimes(1);

      vi.useRealTimers();
    });
  });
});
