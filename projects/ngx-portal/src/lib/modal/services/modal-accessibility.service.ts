import { Injectable, inject } from '@angular/core';
import { OverlayRef } from '@angular/cdk/overlay';
import { FocusTrap } from '@angular/cdk/a11y';
import { ModalConfig } from '../modal-config';
import { PortalAccessibilityService } from '../../shared/services/portal-accessibility.service';

/**
 * Service responsible for handling modal accessibility features (ARIA, focus trap)
 * Delegates to shared PortalAccessibilityService
 */
@Injectable({
  providedIn: 'root',
})
export class ModalAccessibilityService {
  private readonly _portalAccessibility = inject(PortalAccessibilityService);

  /**
   * Sets ARIA attributes on the modal overlay element
   */
  setAriaAttributes(overlayElement: HTMLElement, config?: ModalConfig): void {
    const role = config?.role || 'dialog';
    this._portalAccessibility.setAriaAttributes(overlayElement, config, role);
  }

  /**
   * Creates and initializes a focus trap for the modal
   */
  createFocusTrap(overlayRef: OverlayRef, config?: ModalConfig): FocusTrap {
    return this._portalAccessibility.createFocusTrap(overlayRef, config);
  }

  /**
   * Restores focus to a previously focused element
   */
  restoreFocus(element: HTMLElement | null): void {
    this._portalAccessibility.restoreFocus(element);
  }

  /**
   * Prevents body scrolling
   */
  disableBodyScroll(): void {
    this._portalAccessibility.disableBodyScroll();
  }

  /**
   * Re-enables body scrolling
   */
  enableBodyScroll(): void {
    this._portalAccessibility.enableBodyScroll();
  }
}
