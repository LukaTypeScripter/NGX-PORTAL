import { Injectable, inject } from '@angular/core';
import { Overlay, OverlayConfig } from '@angular/cdk/overlay';
import { ModalConfig } from '../modal-config';

/**
 * Service responsible for creating and configuring modal overlays
 */
@Injectable({
  providedIn: 'root',
})
export class ModalOverlayService {
  private readonly _overlay = inject(Overlay);

  /**
   * Creates an overlay configuration for a modal
   */
  createOverlayConfig<D = unknown>(config?: ModalConfig<D>): OverlayConfig {
    return {
      hasBackdrop: config?.hasBackdrop ?? true,
      backdropClass: config?.backdropClass ?? 'modal-backdrop',
      panelClass: config?.panelClass,
      width: config?.width ?? '500px',
      height: config?.height,
      positionStrategy: this._overlay.position().global().centerHorizontally().centerVertically(),
    };
  }

  /**
   * Creates an overlay with the given configuration
   */
  createOverlay<D = unknown>(config?: ModalConfig<D>) {
    const overlayConfig = this.createOverlayConfig(config);
    return this._overlay.create(overlayConfig);
  }
}
