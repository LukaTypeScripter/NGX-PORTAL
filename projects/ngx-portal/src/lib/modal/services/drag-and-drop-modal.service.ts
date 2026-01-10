import { Injectable } from '@angular/core';
import { ModalRef } from '../modal-ref';
import { OverlayRef } from '@angular/cdk/overlay';

interface DragState {
  isDragging: boolean;
  startX: number;
  startY: number;
  initialLeft: number;
  initialTop: number;
  mousedownHandler: (event: MouseEvent) => void;
  mousemoveHandler: (event: MouseEvent) => void;
  mouseupHandler: (event: MouseEvent) => void;
}

@Injectable({
  providedIn: 'root',
})
export class DragAndDropModalService {
  private dragStates = new WeakMap<ModalRef<any, any>, DragState>();

  createDragAndDropModal<T = unknown, R = unknown>(modalRef: ModalRef<T, R>): void {
    const overlayRef = modalRef.overlayRef;
    const overlayElement = overlayRef.overlayElement;
    const backdropElement = overlayRef.backdropElement;

    overlayElement.classList.add('drag-and-drop-modal');
    if (backdropElement) {
      backdropElement.classList.add('drag-and-drop-modal-backdrop');
    }

    const mousedownHandler = (event: MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      const state = this.dragStates.get(modalRef);
      if (!state || state.isDragging) return;

      state.startX = event.clientX;
      state.startY = event.clientY;
      state.initialLeft = overlayElement.offsetLeft;
      state.initialTop = overlayElement.offsetTop;
      state.isDragging = true;

      overlayElement.classList.add('is-dragging');

      console.log(
        'dragging started',
        state.startX,
        state.startY,
        state.initialLeft,
        state.initialTop,
      );
    };

    const mousemoveHandler = (event: MouseEvent) => {
      const state = this.dragStates.get(modalRef);
      if (!state || !state.isDragging) return;

      event.preventDefault();
      event.stopPropagation();
      const currentX = event.clientX;
      const currentY = event.clientY;
      const deltaX = currentX - state.startX;
      const deltaY = currentY - state.startY;
      const newLeft = state.initialLeft + deltaX;
      const newTop = state.initialTop + deltaY;
      overlayRef.overlayElement.style.position = 'absolute';
      overlayElement.style.left = `${newLeft}px`;
      overlayElement.style.top = `${newTop}px`;
    };

    const mouseupHandler = (event: MouseEvent) => {
      const state = this.dragStates.get(modalRef);
      if (!state || !state.isDragging) return;

      state.isDragging = false;
      overlayElement.classList.remove('is-dragging');
    };

    const dragState: DragState = {
      isDragging: false,
      startX: 0,
      startY: 0,
      initialLeft: 0,
      initialTop: 0,
      mousedownHandler,
      mousemoveHandler,
      mouseupHandler,
    };

    this.dragStates.set(modalRef, dragState);

    overlayElement.addEventListener('mousedown', mousedownHandler);
    document.addEventListener('mousemove', mousemoveHandler);
    document.addEventListener('mouseup', mouseupHandler);
  }

  destroyDragAndDropModal<T = unknown, R = unknown>(modal: ModalRef<T, R>): void {
    const dragState = this.dragStates.get(modal);
    if (!dragState) return;

    const overlayRef = modal.overlayRef;
    const overlayElement = overlayRef.overlayElement;
    const backdropElement = overlayRef.backdropElement;

    overlayElement.removeEventListener('mousedown', dragState.mousedownHandler);
    document.removeEventListener('mousemove', dragState.mousemoveHandler);
    document.removeEventListener('mouseup', dragState.mouseupHandler);

    overlayElement.classList.remove('drag-and-drop-modal', 'is-dragging');
    if (backdropElement) {
      backdropElement.classList.remove('drag-and-drop-modal-backdrop');
    }

    this.dragStates.delete(modal);
  }
}
