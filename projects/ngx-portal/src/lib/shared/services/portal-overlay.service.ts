import { Injectable, inject } from '@angular/core';
import { Overlay, OverlayConfig, PositionStrategy } from '@angular/cdk/overlay';
import { PortalConfigBase } from '../portal-config-base';

/**
 * Shared service for creating CDK overlays
 * Used by both Modal and BottomSheet
 */
@Injectable({
  providedIn: 'root',
})
export class PortalOverlayService {
  private readonly _overlay = inject(Overlay);

  /**
   * Creates an overlay with the given configuration and position strategy
   */
  createOverlay(
    config: PortalConfigBase,
    positionStrategy: PositionStrategy,
    additionalConfig?: Partial<OverlayConfig>,
  ) {
    const overlayConfig: OverlayConfig = {
      hasBackdrop: config.hasBackdrop ?? true,
      backdropClass: config.backdropClass ?? 'cdk-overlay-dark-backdrop',
      panelClass: config.panelClass,
      positionStrategy,
      ...additionalConfig,
    };

    return this._overlay.create(overlayConfig);
  }

  /**
   * Gets the CDK Overlay instance for advanced usage
   */
  getOverlay() {
    return this._overlay;
  }
}
