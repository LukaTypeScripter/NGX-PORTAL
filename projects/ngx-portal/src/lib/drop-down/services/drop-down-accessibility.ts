import { inject, Injectable } from '@angular/core';
import { PortalAccessibilityService } from '../../shared/services/portal-accessibility.service';
import { DropDownConfig } from '../drop-down-config';
import { FocusTrap } from '@angular/cdk/a11y';
import { OverlayRef } from '@angular/cdk/overlay';

@Injectable({
  providedIn: 'root',
})
export class DropDownAccessibility {
  private readonly _portalAccessibility = inject(PortalAccessibilityService);


  setAriaAttributes(overlayElement: HTMLElement, config?: DropDownConfig): void {
    this._portalAccessibility.setAriaAttributes(overlayElement, config, 'dropdown');
  }

  createFocusTrap(overlayRef: OverlayRef, config?: DropDownConfig): FocusTrap {
    return this._portalAccessibility.createFocusTrap(overlayRef, config);
  }

  restoreFocus(element: HTMLElement | null): void {
    this._portalAccessibility.restoreFocus(element);
  }

  disableBodyScroll(): void {
    this._portalAccessibility.disableBodyScroll();
  }

  enableBodyScroll(): void {
    this._portalAccessibility.enableBodyScroll();
  }

}
