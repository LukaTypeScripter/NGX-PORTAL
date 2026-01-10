import { Injectable } from '@angular/core';
import { ModalRef } from '../modal-ref';

type ResizeHandle = 'n' | 'e' | 's' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

interface ResizeState {
  isResizing: boolean;
  handle: ResizeHandle | null;
  startX: number;
  startY: number;
  startWidth: number;
  startHeight: number;
  startLeft: number;
  startTop: number;
  minWidth: number;
  minHeight: number;
  maxWidth: number;
  maxHeight: number;
  handles: HTMLElement[];
  onMouseDown: (event: MouseEvent) => void;
  onMouseMove: (event: MouseEvent) => void;
  onMouseUp: (event: MouseEvent) => void;
}

@Injectable({
  providedIn: 'root',
})
export class ModalResizeService {
  private resizeStates = new WeakMap<ModalRef<any, any>, ResizeState>();

  enableResize<T = unknown, R = unknown>(
    modalRef: ModalRef<T, R>,
    options?: {
      minWidth?: number;
      minHeight?: number;
      maxWidth?: number;
      maxHeight?: number;
      handles?: ResizeHandle[];
    },
  ): void {
    const overlayRef = modalRef.overlayRef;
    const overlayElement = overlayRef.overlayElement;

    const minWidth = options?.minWidth ?? 300;
    const minHeight = options?.minHeight ?? 200;
    const maxWidth = options?.maxWidth ?? window.innerWidth;
    const maxHeight = options?.maxHeight ?? window.innerHeight;
    const enabledHandles = options?.handles ?? ['n', 'e', 's', 'w', 'ne', 'nw', 'se', 'sw'];

    overlayElement.classList.add('resizable-modal');

    const handles: HTMLElement[] = [];

    enabledHandles.forEach((direction) => {
      const handle = document.createElement('div');
      handle.className = `resize-handle resize-handle-${direction}`;
      handle.dataset['direction'] = direction;
      overlayElement.appendChild(handle);
      handles.push(handle);
    });

    const mouseDownHandler = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.classList.contains('resize-handle')) return;

      event.preventDefault();
      event.stopPropagation();

      const state = this.resizeStates.get(modalRef);
      if (!state || state.isResizing) return;

      const direction = target.dataset['direction'] as ResizeHandle;

      state.isResizing = true;
      state.handle = direction;
      state.startX = event.clientX;
      state.startY = event.clientY;
      state.startWidth = overlayElement.offsetWidth;
      state.startHeight = overlayElement.offsetHeight;
      state.startLeft = overlayElement.offsetLeft;
      state.startTop = overlayElement.offsetTop;

      overlayElement.classList.add('is-resizing');
      document.body.style.cursor = this.getCursorForHandle(direction);
    };

    const mouseMoveHandler = (event: MouseEvent) => {
      const state = this.resizeStates.get(modalRef);
      if (!state || !state.isResizing || !state.handle) return;

      event.preventDefault();
      event.stopPropagation();

      const deltaX = event.clientX - state.startX;
      const deltaY = event.clientY - state.startY;

      let newWidth = state.startWidth;
      let newHeight = state.startHeight;
      let newLeft = state.startLeft;
      let newTop = state.startTop;

      if (state.handle.includes('e')) {
        newWidth = Math.max(state.minWidth, Math.min(state.maxWidth, state.startWidth + deltaX));
      }
      if (state.handle.includes('w')) {
        newWidth = Math.max(state.minWidth, Math.min(state.maxWidth, state.startWidth - deltaX));
        if (newWidth !== state.startWidth - deltaX) {
          newLeft = state.startLeft;
        } else {
          newLeft = state.startLeft + deltaX;
        }
      }
      if (state.handle.includes('s')) {
        newHeight = Math.max(
          state.minHeight,
          Math.min(state.maxHeight, state.startHeight + deltaY),
        );
      }
      if (state.handle.includes('n')) {
        newHeight = Math.max(
          state.minHeight,
          Math.min(state.maxHeight, state.startHeight - deltaY),
        );
        if (newHeight !== state.startHeight - deltaY) {
          newTop = state.startTop;
        } else {
          newTop = state.startTop + deltaY;
        }
      }

      overlayElement.style.width = `${newWidth}px`;
      overlayElement.style.height = `${newHeight}px`;
      overlayElement.style.left = `${newLeft}px`;
      overlayElement.style.top = `${newTop}px`;
      overlayElement.style.position = 'absolute';
    };

    const mouseUpHandler = (event: MouseEvent) => {
      const state = this.resizeStates.get(modalRef);
      if (!state || !state.isResizing) return;

      event.preventDefault();
      event.stopPropagation();

      state.isResizing = false;
      state.handle = null;

      overlayElement.classList.remove('is-resizing');
      document.body.style.cursor = '';
    };

    const resizeState: ResizeState = {
      isResizing: false,
      handle: null,
      startX: 0,
      startY: 0,
      startWidth: 0,
      startHeight: 0,
      startLeft: 0,
      startTop: 0,
      minWidth,
      minHeight,
      maxWidth,
      maxHeight,
      handles,
      onMouseDown: mouseDownHandler,
      onMouseMove: mouseMoveHandler,
      onMouseUp: mouseUpHandler,
    };

    this.resizeStates.set(modalRef, resizeState);

    overlayElement.addEventListener('mousedown', mouseDownHandler);
    document.addEventListener('mousemove', mouseMoveHandler);
    document.addEventListener('mouseup', mouseUpHandler);
  }

  disableResize<T = unknown, R = unknown>(modalRef: ModalRef<T, R>): void {
    const resizeState = this.resizeStates.get(modalRef);
    if (!resizeState) return;

    const overlayRef = modalRef.overlayRef;
    const overlayElement = overlayRef.overlayElement;

    overlayElement.removeEventListener('mousedown', resizeState.onMouseDown);
    document.removeEventListener('mousemove', resizeState.onMouseMove);
    document.removeEventListener('mouseup', resizeState.onMouseUp);

    resizeState.handles.forEach((handle) => handle.remove());

    overlayElement.classList.remove('resizable-modal', 'is-resizing');
    document.body.style.cursor = '';

    this.resizeStates.delete(modalRef);
  }

  private getCursorForHandle(handle: ResizeHandle): string {
    const cursors: Record<ResizeHandle, string> = {
      n: 'ns-resize',
      s: 'ns-resize',
      e: 'ew-resize',
      w: 'ew-resize',
      ne: 'nesw-resize',
      sw: 'nesw-resize',
      nw: 'nwse-resize',
      se: 'nwse-resize',
    };
    return cursors[handle];
  }
}
