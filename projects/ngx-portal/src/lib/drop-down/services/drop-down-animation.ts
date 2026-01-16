import { Injectable } from '@angular/core';
import { OverlayRef } from '@angular/cdk/overlay';

@Injectable({
  providedIn: 'root',
})
export class DropDownAnimation {
  private readonly _defaultAnimationDuration = 200;

  /**
   * Applies opening animation to a dropdown
   */
  applyOpeningAnimation(
    overlayRef: OverlayRef,
    animationEnabled: boolean = true,
    animationDuration: number = this._defaultAnimationDuration,
  ): void {
    overlayRef.overlayElement.style.visibility = 'visible';

    if (!animationEnabled) {
      overlayRef.overlayElement.style.opacity = '1';
      this._transitionToOpened(overlayRef);
      return;
    }

    const duration = `${animationDuration}ms`;
    this._setAnimationDuration(overlayRef, duration);

    overlayRef.overlayElement.style.opacity = '';
    overlayRef.overlayElement.classList.add('dropdown-opening');
    if (overlayRef.backdropElement) {
      overlayRef.backdropElement.classList.add('dropdown-backdrop-opening');
    }

    setTimeout(() => {
      this._transitionToOpened(overlayRef);
    }, animationDuration);
  }

  /**
   * Applies closing animation to a dropdown
   */
  applyClosingAnimation(
    overlayRef: OverlayRef,
    animationEnabled: boolean = true,
    animationDuration: number = this._defaultAnimationDuration,
    onComplete?: () => void,
  ): void {
    if (!animationEnabled) {
      if (onComplete) {
        onComplete();
      }
      return;
    }

    const duration = `${animationDuration}ms`;
    this._setAnimationDuration(overlayRef, duration);

    const overlayElement = overlayRef.overlayElement;
    const backdropElement = overlayRef.backdropElement;

    overlayElement.classList.remove('dropdown-opening', 'dropdown-opened');
    overlayElement.classList.add('dropdown-closing');

    if (backdropElement) {
      backdropElement.classList.remove('dropdown-backdrop-opening', 'dropdown-backdrop-opened');
      backdropElement.classList.add('dropdown-backdrop-closing');
    }

    setTimeout(() => {
      if (onComplete) {
        onComplete();
      }
    }, animationDuration);
  }

  /**
   * Gets the default animation duration
   */
  getDefaultDuration(): number {
    return this._defaultAnimationDuration;
  }

  private _setAnimationDuration(overlayRef: OverlayRef, duration: string): void {
    overlayRef.overlayElement.style.setProperty('--dropdown-animation-duration', duration);
    if (overlayRef.backdropElement) {
      overlayRef.backdropElement.style.setProperty('--dropdown-animation-duration', duration);
    }
  }

  private _transitionToOpened(overlayRef: OverlayRef): void {
    overlayRef.overlayElement.classList.remove('dropdown-opening');
    overlayRef.overlayElement.classList.add('dropdown-opened');
    if (overlayRef.backdropElement) {
      overlayRef.backdropElement.classList.remove('dropdown-backdrop-opening');
      overlayRef.backdropElement.classList.add('dropdown-backdrop-opened');
    }
  }
}
