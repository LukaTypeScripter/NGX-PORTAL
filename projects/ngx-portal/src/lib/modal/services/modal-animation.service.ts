import { Injectable } from '@angular/core';
import { OverlayRef } from '@angular/cdk/overlay';
import { ModalRef } from '../modal-ref';

/**
 * Service responsible for handling modal animations
 */
@Injectable({
  providedIn: 'root',
})
export class ModalAnimationService {
  private readonly _defaultAnimationDuration = 300;

  /**
   * Applies opening animation to a modal
   */
  applyOpeningAnimation<T = unknown, R = unknown>(
    overlayRef: OverlayRef,
    modalRef: ModalRef<T, R>,
  ): void {
    if (!modalRef.animationEnabled) {
      return;
    }

    const duration = `${modalRef.animationDuration}ms`;
    this._setAnimationDuration(overlayRef, duration);

    overlayRef.overlayElement.classList.add('modal-opening');
    if (overlayRef.backdropElement) {
      overlayRef.backdropElement.classList.add('modal-backdrop-opening');
    }

    modalRef.openingTimeoutId = setTimeout(() => {
      this._transitionToOpened(overlayRef);
      modalRef.openingTimeoutId = undefined;
    }, modalRef.animationDuration);
  }

  /**
   * Applies closing animation to a modal
   */
  applyClosingAnimation(
    overlayRef: OverlayRef,
    animationEnabled: boolean,
    animationDuration: number,
    onComplete: () => void,
  ): void {
    if (!animationEnabled) {
      onComplete();
      return;
    }

    const duration = `${animationDuration}ms`;
    this._setAnimationDuration(overlayRef, duration);

    const overlayElement = overlayRef.overlayElement;
    const backdropElement = overlayRef.backdropElement;

    overlayElement.classList.remove('modal-opening', 'modal-opened');
    overlayElement.classList.add('modal-closing');

    if (backdropElement) {
      backdropElement.classList.remove('modal-backdrop-opening', 'modal-backdrop-opened');
      backdropElement.classList.add('modal-backdrop-closing');
    }

    setTimeout(() => {
      onComplete();
    }, animationDuration);
  }

  /**
   * Gets the default animation duration
   */
  getDefaultDuration(): number {
    return this._defaultAnimationDuration;
  }

  private _setAnimationDuration(overlayRef: OverlayRef, duration: string): void {
    overlayRef.overlayElement.style.setProperty('--modal-animation-duration', duration);
    if (overlayRef.backdropElement) {
      overlayRef.backdropElement.style.setProperty('--modal-animation-duration', duration);
    }
  }

  private _transitionToOpened(overlayRef: OverlayRef): void {
    overlayRef.overlayElement.classList.remove('modal-opening');
    overlayRef.overlayElement.classList.add('modal-opened');
    if (overlayRef.backdropElement) {
      overlayRef.backdropElement.classList.remove('modal-backdrop-opening');
      overlayRef.backdropElement.classList.add('modal-backdrop-opened');
    }
  }
}
