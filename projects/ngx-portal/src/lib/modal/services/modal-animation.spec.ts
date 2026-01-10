import { ModalAnimationService } from './modal-animation.service';
import { TestBed } from '@angular/core/testing';
import { OverlayRef } from '@angular/cdk/overlay';
import { createModalRefMock } from '../test-helper';

describe('ModalAnimationService', () => {
  let service: ModalAnimationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ModalAnimationService],
    });
    service = TestBed.inject(ModalAnimationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should apply opening animation', async () => {
    const overlayRef = {
      overlayElement: document.createElement('div'),
      backdropElement: document.createElement('div'),
    } as unknown as OverlayRef;
    const modalRef = createModalRefMock();

    service.applyOpeningAnimation(overlayRef, modalRef);

    expect(overlayRef.overlayElement.classList.contains('modal-opening')).toBe(true);
    expect(overlayRef.backdropElement?.classList.contains('modal-backdrop-opening')).toBe(true);
    expect(modalRef.openingTimeoutId).toBeDefined();
    await new Promise((resolve) => setTimeout(resolve, modalRef.animationDuration + 10));

    expect(modalRef.openingTimeoutId).toBeUndefined();
    expect(overlayRef.overlayElement.classList.contains('modal-opening')).toBe(false);
    expect(overlayRef.overlayElement.classList.contains('modal-opened')).toBe(true);
    expect(overlayRef.backdropElement?.classList.contains('modal-backdrop-opening')).toBe(false);
    expect(overlayRef.backdropElement?.classList.contains('modal-backdrop-opened')).toBe(true);
  });

  it('should apply closing animation', async () => {
    const overlayRef = {
      overlayElement: document.createElement('div'),
      backdropElement: document.createElement('div'),
    } as unknown as OverlayRef;
    const modalRef = createModalRefMock();

    overlayRef.overlayElement.classList.add('modal-opened');
    overlayRef.backdropElement?.classList.add('modal-backdrop-opened');

    const onComplete = vi.fn();

    service.applyClosingAnimation(
      overlayRef,
      modalRef.animationEnabled,
      modalRef.animationDuration,
      () => {
        overlayRef.overlayElement.classList.remove('modal-closing');
        overlayRef.overlayElement.classList.add('modal-closed');
        if (overlayRef.backdropElement) {
          overlayRef.backdropElement.classList.remove('modal-backdrop-closing');
          overlayRef.backdropElement.classList.add('modal-backdrop-closed');
        }
        onComplete();
      },
    );

    expect(overlayRef.overlayElement.classList.contains('modal-closing')).toBe(true);
    expect(overlayRef.overlayElement.classList.contains('modal-opened')).toBe(false);
    expect(overlayRef.backdropElement?.classList.contains('modal-backdrop-closing')).toBe(true);
    expect(overlayRef.backdropElement?.classList.contains('modal-backdrop-opened')).toBe(false);

    await new Promise((resolve) => setTimeout(resolve, modalRef.animationDuration + 10));

    expect(overlayRef.overlayElement.classList.contains('modal-closing')).toBe(false);
    expect(overlayRef.overlayElement.classList.contains('modal-closed')).toBe(true);
    expect(overlayRef.backdropElement?.classList.contains('modal-backdrop-closing')).toBe(false);
    expect(overlayRef.backdropElement?.classList.contains('modal-backdrop-closed')).toBe(true);

    expect(onComplete).toHaveBeenCalled();
  });
});
