import { Injectable, inject } from '@angular/core';
import { OverlayRef } from '@angular/cdk/overlay';
import { ModalRef } from '../modal-ref';
import { PortalStackManager } from '../../shared/services/portal-stack-manager.service';

/**
 * Service responsible for managing the modal stack, z-index, and modal IDs
 * Delegates to shared PortalStackManager
 */
@Injectable({
  providedIn: 'root',
})
export class ModalStackManager {
  private readonly _portalStack = inject(PortalStackManager<ModalRef>);

  /**
   * Gets the number of currently open modals as a readonly signal
   */
  readonly openModalsCount = this._portalStack.openCount;

  /**
   * Generates a unique modal ID
   */
  generateModalId(): string {
    return this._portalStack.generateId('modal');
  }

  /**
   * Adds a modal to the stack and returns its level
   */
  addToStack(modalRef: ModalRef<any, any>): number {
    return this._portalStack.addToStack(modalRef);
  }

  /**
   * Removes a modal from the stack
   */
  removeFromStack(modalRef: ModalRef<any, any>): void {
    this._portalStack.removeFromStack(modalRef);
  }

  /**
   * Sets z-index for a modal based on its level
   */
  setZIndex(overlayRef: OverlayRef, level: number): void {
    this._portalStack.setZIndex(overlayRef, level);
  }

  /**
   * Checks if a modal is the topmost in the stack
   */
  isTopmostModal(modalRef: ModalRef<any, any>): boolean {
    return this._portalStack.isTopmost(modalRef);
  }

  /**
   * Gets all open modals
   */
  getAllModals(): readonly ModalRef<any, any>[] {
    return this._portalStack.getAll();
  }

  /**
   * Closes all modals in reverse order (topmost first)
   */
  closeAll(): void {
    this._portalStack.closeAll();
  }

  /**
   * Checks if the stack is empty
   */
  isEmpty(): boolean {
    return this._portalStack.isEmpty();
  }

  /**
   * Gets the current stack size
   */
  getStackSize(): number {
    return this._portalStack.getSize();
  }
}
