import { ComponentType } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { inject, Injectable, InjectionToken, Injector } from '@angular/core';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { DropDownRef } from './drop-down-ref';
import { DropDownConfig } from './drop-down-config';
import { DropDownAnimation } from './services/drop-down-animation';
import { DropDownAccessibility } from './services/drop-down-accessibility';
import { DropDownOverlay } from './services/drop-down-overlay';
import { DropDownStackManager } from './services/drop-down-stack-manager';

/**
 * Main service for opening and managing dropdowns
 */
@Injectable({
  providedIn: 'root',
})
export class DropDown {
  private readonly _injector = inject(Injector);
  private readonly _overlayService = inject(DropDownOverlay);
  private readonly _accessibilityService = inject(DropDownAccessibility);
  private readonly _stackManager = inject(DropDownStackManager);
  private readonly _animationService = inject(DropDownAnimation);

  /**
   * Opens a dropdown with the given component and configuration
   */
  open<T = unknown, D = unknown, R = unknown>(
    component: ComponentType<T>,
    config?: DropDownConfig<D>,
    originElement?: HTMLElement,
  ): DropDownRef<T, R> {
    const dropdownId = this._stackManager.generateDropDownId();

    const overlayRef = this._overlayService.createOverlay(config, originElement);


    const dropdownRef = new DropDownRef<T, R>(overlayRef);

    dropdownRef.level = this._stackManager.addToStack(dropdownRef);

    this._stackManager.setZIndex(overlayRef, dropdownRef.level);

    if (this._stackManager.getStackSize() === 1 && config?.hasBackdrop !== false) {
      this._accessibilityService.disableBodyScroll();
    }

    const customInjector = this._createInjector(dropdownRef, config, this._injector);

    const portal = new ComponentPortal(component, null, customInjector);

    const componentRef = overlayRef.attach(portal);

    dropdownRef.componentInstance = componentRef.instance;

    const animationEnabled = config?.animation ?? true;
    const animationDuration =
      config?.animationDuration ?? this._animationService.getDefaultDuration();

    this._accessibilityService.setAriaAttributes(overlayRef.overlayElement, config);

    this._animationService.applyOpeningAnimation(
      overlayRef,
      animationEnabled,
      animationDuration,
    );

    const focusTrap = this._accessibilityService.createFocusTrap(overlayRef, config);

    const subscriptions: Subscription[] = [];

    if (config?.hasBackdrop !== false && config?.autoCloseOnClickOutside !== false) {
      subscriptions.push(
        overlayRef.backdropClick().subscribe(() => {
          if (this._stackManager.isTopmostDropDown(dropdownRef)) {
            dropdownRef.close();
          }
        }),
      );
    }

    if (config?.autoCloseOnEscape !== false) {
      subscriptions.push(
        overlayRef.keydownEvents().subscribe((event) => {
          if (event.key === 'Escape' && this._stackManager.isTopmostDropDown(dropdownRef)) {
            dropdownRef.close();
          }
        }),
      );
    }

    if (config?.autoCloseOnScroll) {
      subscriptions.push(
        overlayRef.outsidePointerEvents().subscribe((event) => {
          if (
            event.type === 'scroll' &&
            this._stackManager.isTopmostDropDown(dropdownRef)
          ) {
            dropdownRef.close();
          }
        }),
      );
    }

    const previouslyFocusedElement = document.activeElement as HTMLElement;

    const originalClose = dropdownRef.close.bind(dropdownRef);
    dropdownRef.close = (result?: R) => {
      this._animationService.applyClosingAnimation(
        overlayRef,
        animationEnabled,
        animationDuration,
        () => {
          originalClose(result);
        },
      );
    };

    subscriptions.push(
      overlayRef.detachments().subscribe(() => {
        this._stackManager.removeFromStack(dropdownRef);

        focusTrap.destroy();

        subscriptions.forEach((sub) => sub.unsubscribe());

        if (this._stackManager.isEmpty() && config?.hasBackdrop !== false) {
          this._accessibilityService.enableBodyScroll();
        }

        if (this._stackManager.isEmpty()) {
          this._accessibilityService.restoreFocus(previouslyFocusedElement);
        }
      }),
    );

    return dropdownRef;
  }

  private _createInjector<T = unknown, D = unknown, R = unknown>(
    dropdownRef: DropDownRef<T, R>,
    config: DropDownConfig<D> | undefined,
    parentInjector: Injector,
  ): Injector {
    return Injector.create({
      parent: parentInjector,
      providers: [
        { provide: DropDownRef, useValue: dropdownRef },
        { provide: DROPDOWN_DATA, useValue: config?.data },
      ],
    });
  }

  /**
   * Closes all open dropdowns in reverse order (topmost first)
   */
  closeAll(): void {
    this._stackManager.closeAll();
  }

  /**
   * Gets the number of currently open dropdowns as a readonly signal
   */
  readonly openDropDownsCount = this._stackManager.openDropDownsCount;

  /**
   * Gets a readonly array of all open dropdown refs
   */
  get openDropDowns(): readonly DropDownRef<any, any>[] {
    return this._stackManager.getAllDropDowns();
  }
}

export const DROPDOWN_DATA = new InjectionToken<unknown>('DROPDOWN_DATA');


