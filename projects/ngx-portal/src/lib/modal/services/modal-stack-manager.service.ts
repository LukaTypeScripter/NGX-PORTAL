import { Injectable, signal } from '@angular/core';
import { OverlayRef } from '@angular/cdk/overlay';
import { ModalRef } from '../modal-ref';

/**
 * Service responsible for managing the modal stack, z-index, and modal IDs
 */
@Injectable({
  providedIn: 'root',
})
export class ModalStackManager {
  private readonly _modalStack: ModalRef<any, any>[] = [];
  private _modalIdCounter = 0;
  private readonly _baseZIndex = 1000;
  private readonly _zIndexIncrement = 10;
  private readonly _openModalsCountSignal = signal(0);

  /**
   * Gets the number of currently open modals as a readonly signal
   */
  readonly openModalsCount = this._openModalsCountSignal.asReadonly();

  /**
   * Generates a unique modal ID
   */
  generateModalId(): string {
    return `modal-${++this._modalIdCounter}`;
  }

  /**
   * Adds a modal to the stack and returns its level
   */
  addToStack(modalRef: ModalRef<any, any>): number {
    const level = this._modalStack.length;
    this._modalStack.push(modalRef);
    this._openModalsCountSignal.set(this._modalStack.length);
    return level;
  }

  /**
   * Removes a modal from the stack
   */
  removeFromStack(modalRef: ModalRef<any, any>): void {
    const index = this._modalStack.indexOf(modalRef);
    if (index > -1) {
      this._modalStack.splice(index, 1);
      this._openModalsCountSignal.set(this._modalStack.length);
    }
  }

  /**
   * Sets z-index for a modal based on its level
   */
  setZIndex(overlayRef: OverlayRef, level: number): void {
    const backdropZIndex = this._baseZIndex + (level * this._zIndexIncrement);
    const overlayZIndex = backdropZIndex + 1;

    if (overlayRef.backdropElement) {
      overlayRef.backdropElement.style.zIndex = backdropZIndex.toString();
    }
    overlayRef.overlayElement.style.zIndex = overlayZIndex.toString();
  }

  /**
   * Checks if a modal is the topmost in the stack
   */
  isTopmostModal(modalRef: ModalRef<any, any>): boolean {
    return this._modalStack.length > 0 && this._modalStack[this._modalStack.length - 1] === modalRef;
  }

  /**
   * Gets all open modals
   */
  getAllModals(): readonly ModalRef<any, any>[] {
    return [...this._modalStack];
  }

  /**
   * Closes all modals in reverse order (topmost first)
   */
  closeAll(): void {
    const modalsToClose = [...this._modalStack].reverse();
    modalsToClose.forEach(modalRef => modalRef.close());
  }

  /**
   * Checks if the stack is empty
   */
  isEmpty(): boolean {
    return this._modalStack.length === 0;
  }

  /**
   * Gets the current stack size
   */
  getStackSize(): number {
    return this._modalStack.length;
  }
}
