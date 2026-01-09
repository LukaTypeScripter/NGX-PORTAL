import { Injectable, inject } from '@angular/core';
import { OverlayRef } from '@angular/cdk/overlay';
import { ConfigurableFocusTrapFactory, FocusTrap } from '@angular/cdk/a11y';
import { PortalConfigBase } from '../portal-config-base';

/**
 * Shared service for accessibility features
 * Handles focus trap, ARIA attributes, and body scroll management
 */
@Injectable({
  providedIn: 'root',
})
export class PortalAccessibilityService {
  private readonly _focusTrapFactory = inject(ConfigurableFocusTrapFactory);

  /**
   * Sets ARIA attributes on an overlay element
   */
  setAriaAttributes(
    overlayElement: HTMLElement,
    config?: PortalConfigBase,
    role: string = 'dialog'
  ): void {
    if (config?.ariaLabel) {
      overlayElement.setAttribute('aria-label', config.ariaLabel);
    }
    if (config?.ariaLabelledBy) {
      overlayElement.setAttribute('aria-labelledby', config.ariaLabelledBy);
    }
    if (config?.ariaDescribedBy) {
      overlayElement.setAttribute('aria-describedby', config.ariaDescribedBy);
    }
    overlayElement.setAttribute('role', role);
  }

  /**
   * Creates and initializes a focus trap for an overlay
   */
  createFocusTrap(overlayRef: OverlayRef, config?: PortalConfigBase): FocusTrap {
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
