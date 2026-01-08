import { Injectable, inject } from '@angular/core';
import { OverlayRef } from '@angular/cdk/overlay';
import { ConfigurableFocusTrapFactory, FocusTrap } from '@angular/cdk/a11y';
import { ModalConfig } from '../modal-config';

/**
 * Service responsible for handling modal accessibility features (ARIA, focus trap)
 */
@Injectable({
  providedIn: 'root',
})
export class ModalAccessibilityService {
  private readonly _focusTrapFactory = inject(ConfigurableFocusTrapFactory);

  /**
   * Sets ARIA attributes on the modal overlay element
   */
  setAriaAttributes(overlayElement: HTMLElement, config?: ModalConfig): void {
    if (config?.ariaLabel) {
      overlayElement.setAttribute('aria-label', config.ariaLabel);
    }
    if (config?.ariaLabelledBy) {
      overlayElement.setAttribute('aria-labelledby', config.ariaLabelledBy);
    }
    if (config?.ariaDescribedBy) {
      overlayElement.setAttribute('aria-describedby', config.ariaDescribedBy);
    }
    if (config?.role) {
      overlayElement.setAttribute('role', config.role);
    }
  }

  /**
   * Creates and initializes a focus trap for the modal
   */
  createFocusTrap(overlayRef: OverlayRef, config?: ModalConfig): FocusTrap {
    const element = overlayRef.overlayElement;
    const focusTrap = this._focusTrapFactory.create(element);

    if (config?.focusTrap !== false) {
      focusTrap.focusInitialElementWhenReady();
    }

    return focusTrap;
  }

  /**
   * Restores focus to a previously focused element
   */
  restoreFocus(element: HTMLElement | null): void {
    if (element && element.focus) {
      element.focus();
    }
  }

  /**
   * Prevents body scrolling
   */
  disableBodyScroll(): void {
    document.body.style.overflow = 'hidden';
  }

  /**
   * Re-enables body scrolling
   */
  enableBodyScroll(): void {
    document.body.style.overflow = 'auto';
  }
}
