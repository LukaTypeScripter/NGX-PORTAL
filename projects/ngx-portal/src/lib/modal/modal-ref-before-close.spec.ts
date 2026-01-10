import { TestBed } from '@angular/core/testing';
import { ModalRef } from './modal-ref';
import { OverlayRef } from '@angular/cdk/overlay';
import { ModalAnimationService } from './services/modal-animation.service';
import { of, throwError, delay, firstValueFrom } from 'rxjs';
import { vi } from 'vitest';

describe('ModalRef - beforeClose guards', () => {
  let modalRef: ModalRef;
  let animationService: ModalAnimationService;
  let overlayRef: OverlayRef;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ModalAnimationService],
    });

    animationService = TestBed.inject(ModalAnimationService);

    overlayRef = {
      overlayElement: document.createElement('div'),
      backdropElement: document.createElement('div'),
      dispose: vi.fn(),
    } as unknown as OverlayRef;

    modalRef = new ModalRef(overlayRef, 'test-modal', animationService);
    modalRef.animationEnabled = false;
  });

  describe('canClose', () => {
    it('should return true when no guard is set', async () => {
      const result = await firstValueFrom(modalRef.canClose());
      expect(result).toBe(true);
    });

    it('should return true when guard returns true', async () => {
      modalRef.setBeforeCloseGuard(() => true);
      const result = await firstValueFrom(modalRef.canClose());
      expect(result).toBe(true);
    });

    it('should return false when guard returns false', async () => {
      modalRef.setBeforeCloseGuard(() => false);
      const result = await firstValueFrom(modalRef.canClose());
      expect(result).toBe(false);
    });

    it('should handle Promise resolving to true', async () => {
      modalRef.setBeforeCloseGuard(() => Promise.resolve(true));
      const result = await firstValueFrom(modalRef.canClose());
      expect(result).toBe(true);
    });

    it('should handle Promise resolving to false', async () => {
      modalRef.setBeforeCloseGuard(() => Promise.resolve(false));
      const result = await firstValueFrom(modalRef.canClose());
      expect(result).toBe(false);
    });

    it('should handle Promise rejection as false', async () => {
      modalRef.setBeforeCloseGuard(() => Promise.reject('error'));
      const result = await firstValueFrom(modalRef.canClose());
      expect(result).toBe(false);
    });

    it('should handle Observable emitting true', async () => {
      modalRef.setBeforeCloseGuard(() => of(true));
      const result = await firstValueFrom(modalRef.canClose());
      expect(result).toBe(true);
    });

    it('should handle Observable emitting false', async () => {
      modalRef.setBeforeCloseGuard(() => of(false));
      const result = await firstValueFrom(modalRef.canClose());
      expect(result).toBe(false);
    });

    it('should handle Observable error as false', async () => {
      modalRef.setBeforeCloseGuard(() => throwError(() => new Error('test error')));
      const result = await firstValueFrom(modalRef.canClose());
      expect(result).toBe(false);
    });

    it('should handle guard function throwing error', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      modalRef.setBeforeCloseGuard(() => {
        throw new Error('Guard error');
      });

      const result = await firstValueFrom(modalRef.canClose());
      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });

    it('should call guard function when checking', async () => {
      const guardFn = vi.fn(() => true);
      modalRef.setBeforeCloseGuard(guardFn);

      await firstValueFrom(modalRef.canClose());
      expect(guardFn).toHaveBeenCalledTimes(1);
    });
  });

  describe('close with guard', () => {
    it('should close when guard returns true', async () => {
      modalRef.setBeforeCloseGuard(() => true);

      const closePromise = firstValueFrom(modalRef.afterClosed());
      modalRef.close();

      const result = await closePromise;
      expect(result.reason).toBe('programmatic');
    });

    it('should close with data when guard allows', async () => {
      modalRef.setBeforeCloseGuard(() => true);

      const closePromise = firstValueFrom(modalRef.afterClosed());
      modalRef.close({ value: 42 });

      const result = await closePromise;
      expect(result.data).toEqual({ value: 42 });
    });

    it('should close when Promise guard resolves to true', async () => {
      modalRef.setBeforeCloseGuard(() => Promise.resolve(true));

      const closePromise = firstValueFrom(modalRef.afterClosed());
      modalRef.close();

      const result = await closePromise;
      expect(result.reason).toBe('programmatic');
    });

    it('should close when Observable guard emits true', async () => {
      modalRef.setBeforeCloseGuard(() => of(true));

      const closePromise = firstValueFrom(modalRef.afterClosed());
      modalRef.close(undefined, 'escape');

      const result = await closePromise;
      expect(result.reason).toBe('escape');
    });
  });

  describe('forceClose', () => {
    it('should close without checking guard', async () => {
      const guardFn = vi.fn(() => false);
      modalRef.setBeforeCloseGuard(guardFn);

      const closePromise = firstValueFrom(modalRef.afterClosed());
      modalRef.forceClose();

      const result = await closePromise;
      expect(result.reason).toBe('programmatic');
      expect(guardFn).not.toHaveBeenCalled();
    });

    it('should close with data without checking guard', async () => {
      modalRef.setBeforeCloseGuard(() => false);

      const closePromise = firstValueFrom(modalRef.afterClosed());
      modalRef.forceClose({ forced: true });

      const result = await closePromise;
      expect(result.data).toEqual({ forced: true });
    });

    it('should work even when guard would prevent close', async () => {
      modalRef.setBeforeCloseGuard(() => {
        throw new Error('Should not be called');
      });

      const closePromise = firstValueFrom(modalRef.afterClosed());
      modalRef.forceClose(undefined, 'backdrop');

      const result = await closePromise;
      expect(result.reason).toBe('backdrop');
    });
  });

  describe('setBeforeCloseGuard', () => {
    it('should allow setting a guard', () => {
      const guard = () => true;
      expect(() => modalRef.setBeforeCloseGuard(guard)).not.toThrow();
    });

    it('should allow updating the guard', async () => {
      modalRef.setBeforeCloseGuard(() => false);
      modalRef.setBeforeCloseGuard(() => true);

      const result = await firstValueFrom(modalRef.canClose());
      expect(result).toBe(true);
    });

    it('should allow removing the guard by passing undefined', async () => {
      modalRef.setBeforeCloseGuard(() => false);
      modalRef.setBeforeCloseGuard(undefined);

      const result = await firstValueFrom(modalRef.canClose());
      expect(result).toBe(true);
    });
  });

  describe('real-world scenarios', () => {
    it('should simulate form validation guard', async () => {
      const formDirty = true;
      const userConfirms = true;

      modalRef.setBeforeCloseGuard(() => {
        if (!formDirty) return true;
        return userConfirms;
      });

      const result = await firstValueFrom(modalRef.canClose());
      expect(result).toBe(true);
    });

    it('should simulate async API call guard', async () => {
      modalRef.setBeforeCloseGuard(() => {
        return of(true).pipe(delay(10));
      });

      const closePromise = firstValueFrom(modalRef.afterClosed());
      modalRef.close();

      const result = await closePromise;
      expect(result.reason).toBe('programmatic');
    });
  });
});
