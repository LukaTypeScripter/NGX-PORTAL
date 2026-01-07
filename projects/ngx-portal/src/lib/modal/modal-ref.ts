import { OverlayRef } from '@angular/cdk/overlay';
import { ComponentRef, inject } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { CloseReason, CloseResult } from './modal-config';

export class ModalRef<T = unknown, R = unknown> {
    componentInstance?: T;
    animationEnabled = true;
    animationDuration = 300;
    openingTimeoutId?: number;

  constructor(
    private readonly _overlayRef: OverlayRef,
  ) {}

  private _afterClosed = new Subject<CloseResult<R>>();
  private _isClosing = false;

  close(result?: R, reason: CloseReason = 'programmatic'): void {
    if (this._isClosing) {
      return;
    }
    this._isClosing = true;

    if (this.openingTimeoutId) {
      clearTimeout(this.openingTimeoutId);
      this.openingTimeoutId = undefined;
    }

    if (this.animationEnabled) {
      const overlayElement = this._overlayRef.overlayElement;
      const backdropElement = this._overlayRef.backdropElement;

      const duration = `${this.animationDuration}ms`;
      overlayElement.style.setProperty('--modal-animation-duration', duration);
      if (backdropElement) {
        backdropElement.style.setProperty('--modal-animation-duration', duration);
      }

      overlayElement.classList.remove('modal-opening', 'modal-opened');
      overlayElement.classList.add('modal-closing');

      if (backdropElement) {
        backdropElement.classList.remove('modal-backdrop-opening', 'modal-backdrop-opened');
        backdropElement.classList.add('modal-backdrop-closing');
      }

      setTimeout(() => {
        this._overlayRef.dispose();
        this._afterClosed.next({ reason, data: result });
        this._afterClosed.complete();
      }, this.animationDuration);
    } else {
      this._overlayRef.dispose();
      this._afterClosed.next({ reason, data: result });
      this._afterClosed.complete();
    }
  }

  afterClosed(): Observable<CloseResult<R>> {
    return this._afterClosed.asObservable();
  }

}
