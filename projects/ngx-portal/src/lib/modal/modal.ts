import { ComponentType, Overlay, OverlayConfig, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { inject, Injectable, InjectionToken, Injector } from '@angular/core';
import { ModalRef } from './modal-ref';
import { ModalConfig } from './modal-config';
import { Subscription } from 'rxjs';
import { ConfigurableFocusTrapFactory, FocusTrap } from '@angular/cdk/a11y';

@Injectable({
  providedIn: 'root',
})
export class Modal {
  private readonly _overlay = inject(Overlay);
  private readonly _injector = inject(Injector);
  private readonly _focusTrapFactory = inject(ConfigurableFocusTrapFactory);

  open<T = unknown,D = unknown, R = unknown>(
    component: ComponentType<T>,
    config?: ModalConfig<D>,
  ): ModalRef<T, R> {
    // it should prevent scrolling of the body when the modal is open
    this._setBodyOverflow();

    // 1.create overlay
    const overlayRef = this._overlay.create(this._createOverlayConfig(config));
    // 2.create modal ref
    const modalRef = new ModalRef<T, R>(overlayRef);

    // 3.create custom injector
    const customInjector = this._createInjector(modalRef, config, this._injector);

    // 4.create component portal
    const portal = new ComponentPortal(component, null, customInjector);

    // 5.attach component to overlay
    const componentRef = overlayRef.attach(portal);

    // 6.set animation config
    modalRef.animationEnabled = config?.animation ?? true;
    modalRef.animationDuration = config?.animationDuration ?? 300;

    // 7.set aria attributes
    this._setAriaAttributes(overlayRef.overlayElement, config);

    // 8.set component instance
    modalRef.componentInstance = componentRef.instance;

    // 9.add opening animation classes
    this._applyOpeningAnimation(overlayRef, modalRef);

    // 10.setup focus trap
    const focusTrap = this._focusTrap(overlayRef, config);

    // 11.create subscriptions array for this modal instance
    const subscriptions: Subscription[] = [];

    // 12.handle backdrop click
    if(config?.hasBackdrop !== false) {
      subscriptions.push(overlayRef.backdropClick().subscribe(() => {
        modalRef.close();
      }));
    }

    // 13.handle escape key
    this._handleEscapeKey(overlayRef, modalRef, config, subscriptions);

    const previouslyFocusedElement = document.activeElement as HTMLElement;

    // 14.cleanup when modal closes
    subscriptions.push(overlayRef.detachments().subscribe(() => {
      focusTrap.destroy();
      subscriptions.forEach(sub => sub.unsubscribe());

      this._resetBodyOverflow();
      if(previouslyFocusedElement && previouslyFocusedElement.focus) {
        previouslyFocusedElement.focus();
      }
    }));

    // 15.return modal ref
    return modalRef;
  }

  private _createOverlayConfig<D = unknown>(config?: ModalConfig<D>): OverlayConfig {
    return {
      hasBackdrop: config?.hasBackdrop ?? true,
      backdropClass: config?.backdropClass ?? 'modal-backdrop',
      panelClass: config?.panelClass,
      width: config?.width ?? '500px',
      height: config?.height,
      positionStrategy: this._overlay.position().global().centerHorizontally().centerVertically(),
    };
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
    overlayRef: OverlayRef,
    modalRef: ModalRef<T, R>,
    config: ModalConfig<D> | undefined,
    subscriptions: Subscription[]
  ): void {
    if(config?.disableClose) {
      return;
    }
    subscriptions.push(overlayRef.keydownEvents().subscribe((event) => {
      if (event.key === 'Escape') {
        modalRef.close();
      }
    }));
  }

  private _focusTrap(overlayRef: OverlayRef, config: ModalConfig | undefined): FocusTrap {
    const element = overlayRef.overlayElement;

    const focusTrap = this._focusTrapFactory.create(element);

    if(config?.focusTrap !== false) {
      focusTrap.focusInitialElementWhenReady();
    }

    return focusTrap;
  }

  private _setAriaAttributes(overlayElement: HTMLElement, config: ModalConfig | undefined): void {
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

  private _resetBodyOverflow(): void {
    document.body.style.overflow = 'auto';
  }

  private _setBodyOverflow(): void {
    document.body.style.overflow = 'hidden';
  }

  private _applyOpeningAnimation<T = unknown, R = unknown>(overlayRef: OverlayRef, modalRef: ModalRef<T, R>): void {
    if (modalRef.animationEnabled) {
      const duration = `${modalRef.animationDuration}ms`;
      overlayRef.overlayElement.style.setProperty('--modal-animation-duration', duration);
      if (overlayRef.backdropElement) {
        overlayRef.backdropElement.style.setProperty('--modal-animation-duration', duration);
      }

      overlayRef.overlayElement.classList.add('modal-opening');
      if (overlayRef.backdropElement) {
        overlayRef.backdropElement.classList.add('modal-backdrop-opening');
      }

      modalRef.openingTimeoutId = setTimeout(() => {
        overlayRef.overlayElement.classList.remove('modal-opening');
        overlayRef.overlayElement.classList.add('modal-opened');
        if (overlayRef.backdropElement) {
          overlayRef.backdropElement.classList.remove('modal-backdrop-opening');
          overlayRef.backdropElement.classList.add('modal-backdrop-opened');
        }
        modalRef.openingTimeoutId = undefined;
      }, modalRef.animationDuration) as any;
    }
  }
}

export const MODAL_DATA = new InjectionToken<unknown>('MODAL_DATA');
