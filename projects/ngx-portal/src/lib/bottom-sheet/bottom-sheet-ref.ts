import { OverlayRef } from '@angular/cdk/overlay';
import { Observable, Subject } from 'rxjs';
import { BottomSheetAnimationService } from './services/bottom-sheet-animation.service';
import { PortalRefBase } from '../shared/portal-ref-base';

export class BottomSheetRef<T = unknown, R = unknown> extends PortalRefBase {
  readonly overlayRef: OverlayRef;
  readonly id: string;
  componentInstance?: T;
  level: number = 0;

  animationEnabled = true;
  animationDuration = 300;
  currentSnapPointIndex = 0;

  private _afterClosed = new Subject<R | undefined>();
  private _afterDismissed = new Subject<void>();
  private _isClosing = false;
  private _openingTimeoutId?: ReturnType<typeof setTimeout>;

  constructor(
    overlayRef: OverlayRef,
    id: string,
    private readonly _animationService: BottomSheetAnimationService,
  ) {
    super();
    this.overlayRef = overlayRef;
    this.id = id;
  }

  /**
   * Closes the bottom sheet with optional result data
   */
  close(result?: R): void {
    if (this._isClosing) {
      return;
    }

    this._isClosing = true;

    if (this._openingTimeoutId) {
      clearTimeout(this._openingTimeoutId);
      this._openingTimeoutId = undefined;
    }

    this._animationService.applyClosingAnimation(
      this.overlayRef,
      this.animationEnabled,
      this.animationDuration,
      () => {
        this.overlayRef.dispose();
        this._afterClosed.next(result);
        this._afterClosed.complete();
      },
    );
  }

  /**
   * Dismisses the bottom sheet (same as close but without result)
   */
  dismiss(): void {
    this.close(undefined);
    this._afterDismissed.next();
    this._afterDismissed.complete();
  }

  /**
   * Observable that emits when the bottom sheet is closed
   */
  afterClosed(): Observable<R | undefined> {
    return this._afterClosed.asObservable();
  }

  /**
   * Observable that emits when the bottom sheet is dismissed
   */
  afterDismissed(): Observable<void> {
    return this._afterDismissed.asObservable();
  }

  /**
   * Updates the current snap point
   * @param index - Index of the snap point to move to
   */
  updateSnapPoint(index: number): void {
    this.currentSnapPointIndex = index;
  }
}
