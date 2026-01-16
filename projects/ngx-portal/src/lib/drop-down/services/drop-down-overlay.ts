import { inject, Injectable } from '@angular/core';
import { DropDownConfig } from '../drop-down-config';
import { PortalOverlayService } from '../../shared/services/portal-overlay.service';

@Injectable({
  providedIn: 'root',
})
export class DropDownOverlay {
  private readonly _portalOverlay = inject(PortalOverlayService);

  /**
   * Creates an overlay with the given dropdown configuration
   */
  createOverlay<D = unknown>(config?: DropDownConfig<D>, originElement?: HTMLElement) {
    const overlay = this._portalOverlay.getOverlay();
    
    let positionStrategy;
    
    if (originElement) {
      positionStrategy = overlay.position()
        .flexibleConnectedTo(originElement)
        .withPositions([
          {
            originX: 'start',
            originY: 'bottom',
            overlayX: 'start',
            overlayY: 'top',
            offsetX: config?.xOffset ?? 0,
            offsetY: config?.yOffset ?? 0,
          },
          {
            originX: 'start',
            originY: 'top',
            overlayX: 'start',
            overlayY: 'bottom',
            offsetX: config?.xOffset ?? 0,
            offsetY: -(config?.yOffset ?? 0),
          },
        ])
        .withFlexibleDimensions(false)
        .withPush(false);
    } else {
      const globalStrategy = overlay.position().global();
      
      if (config?.xOffset !== undefined || config?.yOffset !== undefined) {
        globalStrategy.left(`${config?.xOffset ?? 0}px`);
        globalStrategy.top(`${config?.yOffset ?? 0}px`);
      } else {
        globalStrategy.centerHorizontally().centerVertically();
      }
      
      positionStrategy = globalStrategy;
    }

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
