import { OverlayRef } from '@angular/cdk/overlay';
import { from, isObservable, Observable, of, Subject } from 'rxjs';
import { BeforeCloseGuard, CloseReason, CloseResult } from './modal-config';
import { ModalAnimationService } from './services/modal-animation.service';
import { catchError } from 'rxjs/operators';
import { PortalRefBase } from '../shared/portal-ref-base';

export class ModalRef<T = unknown, R = unknown> extends PortalRefBase {
  readonly overlayRef: OverlayRef;
  componentInstance?: T;
  animationEnabled = true;
  animationDuration = 300;
  openingTimeoutId?: ReturnType<typeof setTimeout>;
  readonly id: string;
  level: number = 0;

  private _afterClosed = new Subject<CloseResult<R>>();
  private _isClosing = false;
  private _beforeCloseGuard?: BeforeCloseGuard;

  constructor(
    overlayRef: OverlayRef,
    id: string,
    private readonly _animationService: ModalAnimationService,
  ) {
    super();
    this.id = id;
    this.overlayRef = overlayRef;
  }

  /**
   * Sets a guard function that will be called before closing
   */
  setBeforeCloseGuard(guard?: BeforeCloseGuard): void {
    this._beforeCloseGuard = guard;
  }

  /**
   * Checks if the modal can be closed by calling the beforeClose guard if present
   * @returns Observable that emits true if modal can close, false otherwise
   */
  canClose(): Observable<boolean> {
    if (!this._beforeCloseGuard) {
      return of(true);
    }

    try {
      const result = this._beforeCloseGuard();

      if (typeof result === 'boolean') {
        return of(result);
      }

      if (result instanceof Promise) {
        return from(result).pipe(catchError(() => of(false)));
      }

      if (isObservable(result)) {
        return result.pipe(catchError(() => of(false)));
      }

      return of(false);
    } catch (error) {
      console.error('Error in beforeClose guard:', error);
      return of(false);
    }
  }

  /**
   * Attempts to close the modal after checking the beforeClose guard
   */
  close(result?: R, reason: CloseReason = 'programmatic'): void {
    if (this._isClosing) {
      return;
    }

    this.canClose().subscribe((canClose) => {
      if (!canClose) {
        return;
      }

      this._isClosing = true;

      if (this.openingTimeoutId) {
        clearTimeout(this.openingTimeoutId);
        this.openingTimeoutId = undefined;
      }

      this._animationService.applyClosingAnimation(
        this.overlayRef,
        this.animationEnabled,
        this.animationDuration,
        () => {
          this.overlayRef.dispose();
          this._afterClosed.next({ reason, data: result });
          this._afterClosed.complete();
        },
      );
    });
  }

  /**
   * Forces the modal to close without checking the beforeClose guard
   * Use with caution - bypasses user confirmation
   */
  forceClose(result?: R, reason: CloseReason = 'programmatic'): void {
    if (this._isClosing) {
      return;
    }
    this._isClosing = true;

    if (this.openingTimeoutId) {
      clearTimeout(this.openingTimeoutId);
      this.openingTimeoutId = undefined;
    }

    this._animationService.applyClosingAnimation(
      this.overlayRef,
      this.animationEnabled,
      this.animationDuration,
      () => {
        this.overlayRef.dispose();
        this._afterClosed.next({ reason, data: result });
        this._afterClosed.complete();
      },
    );
  }

  afterClosed(): Observable<CloseResult<R>> {
    return this._afterClosed.asObservable();
  }
}
