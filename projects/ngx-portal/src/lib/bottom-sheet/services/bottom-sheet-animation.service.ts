import { Injectable } from '@angular/core';
import { BottomSheetRef } from '../bottom-sheet-ref';
import { OverlayRef } from '@angular/cdk/overlay';

/**
 * Service responsible for handling bottom sheet animations
 * Manages slide up/down animations and snap point transitions
 */
@Injectable({
  providedIn: 'root',
})
export class BottomSheetAnimationService {
  private readonly _defaultDuration = 300;

  /**
   * Gets the default animation duration
   */
  getDefaultDuration(): number {
    return this._defaultDuration;
  }

  /**
   * Applies the opening (slide up) animation to a bottom sheet
   */
  applyOpeningAnimation(
    overlayRef: OverlayRef,
    bottomSheetRef: BottomSheetRef<any, any>,
    animationEnabled: boolean = true,
    duration: number = this._defaultDuration
  ): void {
    const overlayElement = overlayRef.overlayElement;
    const backdropElement = overlayRef.backdropElement;

    if (!animationEnabled) {
      this._transitionToOpened(overlayRef);
      return;
    }

    this._setAnimationDuration(overlayRef, `${duration}ms`);

    overlayElement.classList.add('bottom-sheet-opened');
    if (backdropElement) {
      backdropElement.classList.add('bottom-sheet-backdrop-opening');
    }

    const transitionTimeout = setTimeout(() => {
      if (backdropElement) {
        backdropElement.classList.remove('bottom-sheet-backdrop-opening');
        backdropElement.classList.add('bottom-sheet-backdrop-opened');
      }
    }, duration);

    (bottomSheetRef as any)._openingTimeoutId = transitionTimeout;
  }

  /**
   * Applies the closing (slide down) animation to a bottom sheet
   */
  applyClosingAnimation(
    overlayRef: OverlayRef,
    animationEnabled: boolean = true,
    duration: number = this._defaultDuration,
    onComplete?: () => void
  ): void {
    const overlayElement = overlayRef.overlayElement;
    const backdropElement = overlayRef.backdropElement;

    if (!animationEnabled) {
      if (onComplete) {
        onComplete();
      }
      return;
    }

    this._setAnimationDuration(overlayRef, `${duration}ms`);

    overlayElement.classList.remove('bottom-sheet-opening', 'bottom-sheet-opened');
    if (backdropElement) {
      backdropElement.classList.remove('bottom-sheet-backdrop-opening', 'bottom-sheet-backdrop-opened');
    }

    overlayElement.classList.add('bottom-sheet-closing');
    if (backdropElement) {
      backdropElement.classList.add('bottom-sheet-backdrop-closing');
    }

    setTimeout(() => {
      this._transitionToClosed(overlayRef);
      if (onComplete) {
        onComplete();
      }
    }, duration);
  }

  /**
   * Applies snap transition animation when moving between snap points
   */
  applySnapAnimation(
    overlayRef: OverlayRef,
    targetPosition: number,
    duration: number = this._defaultDuration,
    useSpring: boolean = true
  ): void {
    const overlayElement = overlayRef.overlayElement;

    overlayElement.classList.remove('bottom-sheet-dragging');

    if (useSpring) {
      overlayElement.classList.add('bottom-sheet-snapping');
      this._setAnimationDuration(overlayRef, `${duration}ms`);

      // Force reflow to ensure transition class is applied before transform changes
      void overlayElement.offsetHeight;

      overlayElement.style.transform = `translateY(${targetPosition}px)`;

      setTimeout(() => {
        overlayElement.classList.remove('bottom-sheet-snapping');
      }, duration);
    } else {
      overlayElement.style.transition = `transform ${duration}ms ease-out`;
      overlayElement.style.transform = `translateY(${targetPosition}px)`;

      setTimeout(() => {
        overlayElement.style.transition = '';
      }, duration);
    }
  }

  /**
   * Updates position during drag (no animation)
   */
  updateDragPosition(overlayRef: OverlayRef, position: number): void {
    const overlayElement = overlayRef.overlayElement;

    if (!overlayElement.classList.contains('bottom-sheet-dragging')) {
      overlayElement.classList.add('bottom-sheet-dragging');
    }

    overlayElement.style.transform = `translateY(${position}px)`;
  }

  /**
   * Resets all animation classes and transforms
   */
  resetAnimation(overlayRef: OverlayRef): void {
    const overlayElement = overlayRef.overlayElement;
    const backdropElement = overlayRef.backdropElement;

    overlayElement.classList.remove(
      'bottom-sheet-opening',
      'bottom-sheet-opened',
      'bottom-sheet-closing',
      'bottom-sheet-closed',
      'bottom-sheet-snapping',
      'bottom-sheet-dragging'
    );

    if (backdropElement) {
      backdropElement.classList.remove(
        'bottom-sheet-backdrop-opening',
        'bottom-sheet-backdrop-opened',
        'bottom-sheet-backdrop-closing',
        'bottom-sheet-backdrop-closed'
      );
    }

    overlayElement.style.transform = '';
    overlayElement.style.transition = '';
  }

  private _setAnimationDuration(overlayRef: OverlayRef, duration: string): void {
    overlayRef.overlayElement.style.setProperty('--bottom-sheet-animation-duration', duration);
    if (overlayRef.backdropElement) {
      overlayRef.backdropElement.style.setProperty('--bottom-sheet-animation-duration', duration);
    }
  }

  private _transitionToOpened(overlayRef: OverlayRef): void {
    const overlayElement = overlayRef.overlayElement;
    const backdropElement = overlayRef.backdropElement;

    overlayElement.classList.remove('bottom-sheet-opening');
    overlayElement.classList.add('bottom-sheet-opened');

    if (backdropElement) {
      backdropElement.classList.remove('bottom-sheet-backdrop-opening');
      backdropElement.classList.add('bottom-sheet-backdrop-opened');
    }
  }

  private _transitionToClosed(overlayRef: OverlayRef): void {
    const overlayElement = overlayRef.overlayElement;
    const backdropElement = overlayRef.backdropElement;

    overlayElement.classList.remove('bottom-sheet-closing');
    overlayElement.classList.add('bottom-sheet-closed');

    if (backdropElement) {
      backdropElement.classList.remove('bottom-sheet-backdrop-closing');
      backdropElement.classList.add('bottom-sheet-backdrop-closed');
    }
  }
}
