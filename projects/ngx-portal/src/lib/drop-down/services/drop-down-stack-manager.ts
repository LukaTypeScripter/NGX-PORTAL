import { inject, Injectable } from '@angular/core';
import { DropDownRef } from '../drop-down-ref';
import { PortalStackManager } from '../../shared/services/portal-stack-manager.service';
import { OverlayRef } from '@angular/cdk/overlay';

@Injectable({
  providedIn: 'root',
})
export class DropDownStackManager {
  private readonly _portalStack = inject(PortalStackManager<DropDownRef>);


  readonly openDropDownsCount = this._portalStack.openCount;

  generateDropDownId(): string {
    return this._portalStack.generateId('drop-down');
  }


  addToStack(dropDownRef: DropDownRef<any, any>): number {
    return this._portalStack.addToStack(dropDownRef);
  }

  removeFromStack(dropDownRef: DropDownRef<any, any>): void {
    this._portalStack.removeFromStack(dropDownRef);
  }

  setZIndex(overlayRef: OverlayRef, level: number): void {
    this._portalStack.setZIndex(overlayRef, level);
  }

  isTopmostDropDown(dropDownRef: DropDownRef<any, any>): boolean {
    return this._portalStack.isTopmost(dropDownRef);
  }

  getAllDropDowns(): readonly DropDownRef<any, any>[] {
    return this._portalStack.getAll();
  }

  closeAll(): void {
    this._portalStack.closeAll();
  }

  isEmpty(): boolean {
    return this._portalStack.isEmpty();
  }

  getStackSize(): number {
    return this._portalStack.getSize();
  }
  
}
