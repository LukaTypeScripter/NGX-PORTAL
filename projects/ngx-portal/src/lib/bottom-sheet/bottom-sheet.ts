import { ComponentType } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { inject, Injectable, InjectionToken, Injector } from '@angular/core';
import { Subscription } from 'rxjs';
import { BottomSheetRef } from './bottom-sheet-ref';
import { BottomSheetConfig } from './bottom-sheet-config';
import { BottomSheetAnimationService } from './services/bottom-sheet-animation.service';
import { BottomSheetGestureService } from './services/bottom-sheet-gesture.service';
import { BottomSheetSnapService } from './services/bottom-sheet-snap.service';
import { PortalOverlayService } from '../shared/services/portal-overlay.service';
import { PortalAccessibilityService } from '../shared/services/portal-accessibility.service';
import { PortalStackManager } from '../shared/services/portal-stack-manager.service';
import { BottomSheetContainerComponent } from './bottom-sheet-container.component';

/**
 * Main service for opening and managing bottom sheets
 */
@Injectable({
  providedIn: 'root',
})
export class BottomSheet {
  private readonly _injector = inject(Injector);
  private readonly _portalOverlay = inject(PortalOverlayService);
  private readonly _accessibilityService = inject(PortalAccessibilityService);
  private readonly _stackManager = inject(PortalStackManager<BottomSheetRef>);
  private readonly _animationService = inject(BottomSheetAnimationService);
  private readonly _gestureService = inject(BottomSheetGestureService);
  private readonly _snapService = inject(BottomSheetSnapService);

  private _snapPointsMap = new WeakMap<BottomSheetRef<any, any>, any[]>();
  private _dragHandleMap = new WeakMap<BottomSheetRef<any, any>, HTMLElement>();
  private _currentTransformMap = new WeakMap<BottomSheetRef<any, any>, number>();

  open<T = unknown, D = unknown, R = unknown>(
    component: ComponentType<T>,
    config?: BottomSheetConfig<D>,
  ): BottomSheetRef<T, R> {
    const bottomSheetId = this._stackManager.generateId('bottom-sheet');

    const overlay = this._portalOverlay.getOverlay();
    const positionStrategy = overlay.position().global().bottom('0').centerHorizontally();

    const overlayRef = this._portalOverlay.createOverlay(
      {
        ...config,
        backdropClass: config?.backdropClass ?? 'bottom-sheet-backdrop',
      },
      positionStrategy,
      {
        panelClass: [
          'bottom-sheet-container',
          ...(Array.isArray(config?.panelClass)
            ? config.panelClass
            : config?.panelClass
              ? [config.panelClass]
              : []),
        ],
        width: '100%',
        maxWidth: '100vw',
      },
    );

    const bottomSheetRef = new BottomSheetRef<T, R>(
      overlayRef,
      bottomSheetId,
      this._animationService,
    );

    bottomSheetRef.level = this._stackManager.addToStack(bottomSheetRef);
    this._stackManager.setZIndex(overlayRef, bottomSheetRef.level);

    if (this._stackManager.getSize() === 1) {
      this._accessibilityService.disableBodyScroll();
    }

    this._accessibilityService.setAriaAttributes(overlayRef.overlayElement, config, 'dialog');

    const customInjector = this._createInjector(bottomSheetRef, config, this._injector);

    const portal = new ComponentPortal(component, null, customInjector);
    const componentRef = overlayRef.attach(portal);
    bottomSheetRef.componentInstance = componentRef.instance;

    bottomSheetRef.animationEnabled = config?.animation ?? true;
    bottomSheetRef.animationDuration =
      config?.animationDuration ?? this._animationService.getDefaultDuration();

    const snapPoints = config?.snapPoints ?? [0.5, 1.0];
    if (!this._snapService.validateSnapPoints(snapPoints)) {
      console.warn('Invalid snap points, using defaults: [0.5, 1.0]');
    }

    const parsedSnapPoints = this._snapService.parseSnapPoints(snapPoints, window.innerHeight);
    this._snapPointsMap.set(bottomSheetRef, parsedSnapPoints);

    const initialSnapIndex = config?.initialSnapPoint ?? 0;
    const initialSnapPoint = this._snapService.getInitialSnapPoint(
      parsedSnapPoints,
      initialSnapIndex,
    );
    bottomSheetRef.currentSnapPointIndex = initialSnapPoint.index;

    const overlayElement = overlayRef.overlayElement;
    overlayElement.style.position = 'fixed';
    overlayElement.style.bottom = '0';
    overlayElement.style.top = 'auto';
    overlayElement.style.left = '0';
    overlayElement.style.right = '0';
    overlayElement.style.margin = '0';
    overlayElement.style.maxHeight = '90vh';
    overlayElement.style.width = '100%';

    overlayElement.style.transform = `translateY(${window.innerHeight}px)`;

    requestAnimationFrame(() => {
      overlayElement.style.position = 'fixed';
      overlayElement.style.bottom = '0';
      overlayElement.style.top = 'auto';
      overlayElement.style.left = '0';
      overlayElement.style.right = '0';
    });

    if (config?.enableDrag !== false) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const dragHandle = this._findDragHandle(overlayRef.overlayElement, config?.dragHandle);
          if (dragHandle) {
            this._dragHandleMap.set(bottomSheetRef, dragHandle);
            this._setupGestureHandling(bottomSheetRef, dragHandle, config);
          }
        });
      });
    }

    const focusTrap = this._accessibilityService.createFocusTrap(overlayRef, config);
    const previouslyFocusedElement = document.activeElement as HTMLElement;

    const subscriptions: Subscription[] = [];

    if (config?.hasBackdrop !== false && config?.disableClose !== true) {
      subscriptions.push(
        overlayRef.backdropClick().subscribe(() => {
          if (this._stackManager.isTopmost(bottomSheetRef)) {
            bottomSheetRef.dismiss();
          }
        }),
      );
    }

    subscriptions.push(
      overlayRef.detachments().subscribe(() => {
        this._stackManager.removeFromStack(bottomSheetRef);

        const dragHandle = this._dragHandleMap.get(bottomSheetRef);
        if (dragHandle) {
          this._gestureService.disableGestures(bottomSheetRef, dragHandle);
          this._dragHandleMap.delete(bottomSheetRef);
        }

        this._snapPointsMap.delete(bottomSheetRef);
        this._currentTransformMap.delete(bottomSheetRef);

        focusTrap.destroy();

        subscriptions.forEach((sub) => sub.unsubscribe());

        if (this._stackManager.isEmpty()) {
          this._accessibilityService.enableBodyScroll();
          this._accessibilityService.restoreFocus(previouslyFocusedElement);
        }
      }),
    );

    this._animationService.applyOpeningAnimation(
      overlayRef,
      bottomSheetRef,
      bottomSheetRef.animationEnabled,
      bottomSheetRef.animationDuration,
    );

    if (bottomSheetRef.animationEnabled) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const sheetHeight = overlayElement.offsetHeight;
          const initialPosition = this._snapService.calculateSheetPosition(
            initialSnapPoint,
            sheetHeight,
          );
          this._currentTransformMap.set(bottomSheetRef, initialPosition);
          this._animationService.applySnapAnimation(
            overlayRef,
            initialPosition,
            bottomSheetRef.animationDuration,
            true,
          );
        });
      });
    } else {
      requestAnimationFrame(() => {
        const sheetHeight = overlayElement.offsetHeight;
        const initialPosition = this._snapService.calculateSheetPosition(
          initialSnapPoint,
          sheetHeight,
        );
        this._currentTransformMap.set(bottomSheetRef, initialPosition);
        overlayRef.overlayElement.style.transform = `translateY(${initialPosition}px)`;
      });
    }

    return bottomSheetRef;
  }

  /**
   * Closes all open bottom sheets
   */
  dismissAll(): void {
    this._stackManager.closeAll();
  }

  /**
   * Gets the number of currently open bottom sheets as a readonly signal
   */
  readonly openBottomSheetsCount = this._stackManager.openCount;

  /**
   * Gets all open bottom sheets
   */
  get openBottomSheets(): readonly BottomSheetRef<any, any>[] {
    return this._stackManager.getAll();
  }

  private _createInjector<T = unknown, D = unknown, R = unknown>(
    bottomSheetRef: BottomSheetRef<T, R>,
    config: BottomSheetConfig<D> | undefined,
    parentInjector: Injector,
  ): Injector {
    return Injector.create({
      parent: parentInjector,
      providers: [
        { provide: BottomSheetRef, useValue: bottomSheetRef },
        { provide: BOTTOM_SHEET_DATA, useValue: config?.data },
      ],
    });
  }

  private _findDragHandle(
    overlayElement: HTMLElement,
    showHandle: boolean = true,
  ): HTMLElement | null {
    if (!showHandle) {
      return overlayElement;
    }

    const handle = overlayElement.querySelector('.bottom-sheet-drag-handle') as HTMLElement;
    return handle || overlayElement;
  }

  private _setupGestureHandling<T, R, D>(
    bottomSheetRef: BottomSheetRef<T, R>,
    dragHandle: HTMLElement,
    config?: BottomSheetConfig<D>,
  ): void {
    const overlayElement = bottomSheetRef.overlayRef.overlayElement;
    const parsedSnapPoints = this._snapPointsMap.get(bottomSheetRef);

    if (!parsedSnapPoints) return;

    let initialTranslateY = 0;

    this._gestureService.enableGestures(
      bottomSheetRef,
      dragHandle,
      () => {
        initialTranslateY = this._currentTransformMap.get(bottomSheetRef) ?? 0;
      },
      (deltaY: number, currentY: number) => {
        const newTranslateY = initialTranslateY + deltaY;
        const boundedTranslateY = Math.max(0, newTranslateY);
        this._currentTransformMap.set(bottomSheetRef, boundedTranslateY);
        this._animationService.updateDragPosition(bottomSheetRef.overlayRef, boundedTranslateY);
      },
      (velocity: number, deltaY: number) => {
        const currentTop = overlayElement.getBoundingClientRect().top;
        const viewportHeight = window.innerHeight;
        const currentVisibleHeight = viewportHeight - currentTop;
        const velocityThreshold = config?.swipeVelocityThreshold ?? 0.5;
        const dismissThreshold = config?.dismissThreshold ?? 0.3;

        if (config?.dismissOnSwipeDown !== false) {
          const minVisibleHeight = viewportHeight * dismissThreshold;
          const swipe = this._gestureService.isSwipe(velocity, velocityThreshold);
          const isBelowThreshold = currentVisibleHeight < minVisibleHeight;

          if (isBelowThreshold) {
            bottomSheetRef.dismiss();
            return;
          }

          if (swipe.isSwipe && swipe.direction === 'down') {
            const lowestSnapPoint = parsedSnapPoints[0];
            if (currentVisibleHeight < lowestSnapPoint.value) {
              bottomSheetRef.dismiss();
              return;
            }
          }
        }

        const targetSnapPoint = this._snapService.determineTargetSnapPoint(
          currentVisibleHeight,
          velocity,
          parsedSnapPoints,
          velocityThreshold,
        );

        if (targetSnapPoint === null) {
          bottomSheetRef.dismiss();
        } else {
          const sheetHeight = overlayElement.offsetHeight;
          const targetPosition = this._snapService.calculateSheetPosition(
            targetSnapPoint,
            sheetHeight,
          );
          this._currentTransformMap.set(bottomSheetRef, targetPosition);
          bottomSheetRef.updateSnapPoint(targetSnapPoint.index);
          this._animationService.applySnapAnimation(
            bottomSheetRef.overlayRef,
            targetPosition,
            bottomSheetRef.animationDuration,
            true,
          );
        }
      },
    );
  }
}

export const BOTTOM_SHEET_DATA = new InjectionToken<unknown>('BOTTOM_SHEET_DATA');
