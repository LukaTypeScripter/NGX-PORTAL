import { Injectable, inject } from '@angular/core';
import { ModalConfig } from '../modal-config';
import { PortalOverlayService } from '../../shared/services/portal-overlay.service';

/**
 * Service responsible for creating and configuring modal overlays
 * Delegates to shared PortalOverlayService
 */
@Injectable({
  providedIn: 'root',
})
export class ModalOverlayService {
  private readonly _portalOverlay = inject(PortalOverlayService);

  /**
   * Creates an overlay with the given modal configuration
   */
  createOverlay<D = unknown>(config?: ModalConfig<D>) {
    const overlay = this._portalOverlay.getOverlay();
    const positionStrategy = overlay.position().global().centerHorizontally().centerVertically();

    return this._portalOverlay.createOverlay(
      {
        ...config,
        backdropClass: config?.backdropClass ?? 'modal-backdrop',
      },
      positionStrategy,
      {
        width: config?.width ?? '500px',
        height: config?.height,
      },
    );
  }
}
