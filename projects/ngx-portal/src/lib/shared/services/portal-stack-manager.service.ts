import { Injectable, signal } from '@angular/core';
import { OverlayRef } from '@angular/cdk/overlay';
import { PortalRefBase } from '../portal-ref-base';

/**
 * Shared service for managing overlay stack
 * Handles z-index, stack ordering, and ID generation
 * Generic to work with any PortalRefBase (Modal, BottomSheet, etc.)
 */
@Injectable({
  providedIn: 'root',
})
export class PortalStackManager<T extends PortalRefBase = PortalRefBase> {
  private readonly _stack: T[] = [];
  private _idCounter = 0;
  private readonly _baseZIndex = 1000;
  private readonly _zIndexIncrement = 10;
  private readonly _openCountSignal = signal(0);

  /**
   * Gets the number of currently open overlays as a readonly signal
   */
  readonly openCount = this._openCountSignal.asReadonly();

  /**
   * Generates a unique ID for an overlay
   */
  generateId(prefix: string = 'portal'): string {
    return `${prefix}-${++this._idCounter}`;
  }

  /**
   * Adds an overlay to the stack and returns its level
   */
  addToStack(ref: T): number {
    const level = this._stack.length;
    this._stack.push(ref);
    this._openCountSignal.set(this._stack.length);
    return level;
  }

  /**
   * Removes an overlay from the stack
   */
  removeFromStack(ref: T): void {
    const index = this._stack.indexOf(ref);
    if (index > -1) {
      this._stack.splice(index, 1);
      this._openCountSignal.set(this._stack.length);
    }
  }

  /**
   * Sets z-index for an overlay based on its level
   */
  setZIndex(overlayRef: OverlayRef, level: number): void {
    const backdropZIndex = this._baseZIndex + level * this._zIndexIncrement;
    const overlayZIndex = backdropZIndex + 1;

    if (overlayRef.backdropElement) {
      overlayRef.backdropElement.style.zIndex = backdropZIndex.toString();
    }
    overlayRef.overlayElement.style.zIndex = overlayZIndex.toString();
  }

  /**
   * Checks if an overlay is the topmost in the stack
   */
  isTopmost(ref: T): boolean {
    return this._stack.length > 0 && this._stack[this._stack.length - 1] === ref;
  }

  /**
   * Gets all open overlays
   */
  getAll(): readonly T[] {
    return [...this._stack];
  }

  /**
   * Closes all overlays in reverse order (topmost first)
   */
  closeAll(): void {
    const refsToClose = [...this._stack].reverse();
    refsToClose.forEach(ref => ref.close());
  }

  /**
   * Checks if the stack is empty
   */
  isEmpty(): boolean {
    return this._stack.length === 0;
  }

  /**
   * Gets the current stack size
   */
  getSize(): number {
    return this._stack.length;
  }
}
