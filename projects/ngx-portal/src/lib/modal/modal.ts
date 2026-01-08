import { ComponentType } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { inject, Injectable, InjectionToken, Injector } from '@angular/core';
import { ModalRef } from './modal-ref';
import { ModalConfig } from './modal-config';
import { Subscription } from 'rxjs';
import { ModalStackManager } from './services/modal-stack-manager.service';
import { ModalAnimationService } from './services/modal-animation.service';
import { ModalAccessibilityService } from './services/modal-accessibility.service';
import { ModalOverlayService } from './services/modal-overlay.service';

/**
 * Main modal service that acts as a facade for modal operations
 * Delegates responsibilities to specialized services
 */
@Injectable({
  providedIn: 'root',
})
export class Modal {
  private readonly _injector = inject(Injector);
  private readonly _stackManager = inject(ModalStackManager);
  private readonly _animationService = inject(ModalAnimationService);
  private readonly _accessibilityService = inject(ModalAccessibilityService);
  private readonly _overlayService = inject(ModalOverlayService);

  open<T = unknown,D = unknown, R = unknown>(
    component: ComponentType<T>,
    config?: ModalConfig<D>,
  ): ModalRef<T, R> {
    const modalId = this._stackManager.generateModalId();

    const overlayRef = this._overlayService.createOverlay(config);

    const modalRef = new ModalRef<T, R>(overlayRef, modalId, this._animationService);

    modalRef.level = this._stackManager.addToStack(modalRef);

    this._stackManager.setZIndex(overlayRef, modalRef.level);

    if (this._stackManager.getStackSize() === 1) {
      this._accessibilityService.disableBodyScroll();
    }

    const customInjector = this._createInjector(modalRef, config, this._injector);

    const portal = new ComponentPortal(component, null, customInjector);

    const componentRef = overlayRef.attach(portal);

    modalRef.animationEnabled = config?.animation ?? true;
    modalRef.animationDuration = config?.animationDuration ?? this._animationService.getDefaultDuration();

    this._accessibilityService.setAriaAttributes(overlayRef.overlayElement, config);

    modalRef.componentInstance = componentRef.instance;

    if (config?.beforeClose) {
      modalRef.setBeforeCloseGuard(config.beforeClose);
    }

    this._animationService.applyOpeningAnimation(overlayRef, modalRef);

    const focusTrap = this._accessibilityService.createFocusTrap(overlayRef, config);

    const subscriptions: Subscription[] = [];

    if(config?.hasBackdrop !== false) {
      subscriptions.push(overlayRef.backdropClick().subscribe(() => {
        if (this._stackManager.isTopmostModal(modalRef)) {
          modalRef.close(undefined, 'backdrop');
        }
      }));
    }

    this._handleEscapeKey(overlayRef, modalRef, config, subscriptions);

    const previouslyFocusedElement = document.activeElement as HTMLElement;

    subscriptions.push(overlayRef.detachments().subscribe(() => {
      this._stackManager.removeFromStack(modalRef);

      focusTrap.destroy();

      subscriptions.forEach(sub => sub.unsubscribe());

      if (this._stackManager.isEmpty()) {
        this._accessibilityService.enableBodyScroll();
      }

      if (this._stackManager.isEmpty()) {
        this._accessibilityService.restoreFocus(previouslyFocusedElement);
      }
    }));

    return modalRef;
  }

  private _createInjector<T = unknown, D = unknown, R = unknown>(
    modalRef: ModalRef<T, R>,
    config: ModalConfig<D> | undefined,
    parentInjector: Injector,
  ): Injector {
    return Injector.create({
      parent: parentInjector,
      providers: [
        { provide: ModalRef, useValue: modalRef },
        { provide: MODAL_DATA, useValue: config?.data },
      ],
    });
  }

  private _handleEscapeKey<T = unknown, D = unknown, R = unknown>(
    overlayRef: import('@angular/cdk/overlay').OverlayRef,
    modalRef: ModalRef<T, R>,
    config: ModalConfig<D> | undefined,
    subscriptions: Subscription[]
  ): void {
    if(config?.disableClose) {
      return;
    }
    subscriptions.push(overlayRef.keydownEvents().subscribe((event) => {
      if (event.key === 'Escape' && this._stackManager.isTopmostModal(modalRef)) {
        modalRef.close(undefined, 'escape');
      }
    }));
  }

  /**
   * Closes all open modals in reverse order (topmost first)
   */
  closeAll(): void {
    this._stackManager.closeAll();
  }

  /**
   * Gets the number of currently open modals as a readonly signal
   */
  readonly openModalsCount = this._stackManager.openModalsCount;

  /**
   * Gets a readonly array of all open modal refs
   */
  get openModals(): readonly ModalRef<any, any>[] {
    return this._stackManager.getAllModals();
  }
}

export const MODAL_DATA = new InjectionToken<unknown>('MODAL_DATA');
