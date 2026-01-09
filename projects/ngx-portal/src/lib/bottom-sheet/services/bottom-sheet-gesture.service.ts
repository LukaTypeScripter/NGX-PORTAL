import { Injectable } from '@angular/core';
import { BottomSheetRef } from '../bottom-sheet-ref';

interface PositionSnapshot {
  y: number;
  timestamp: number;
}

interface GestureState {
  isDragging: boolean;
  startY: number;
  currentY: number;
  initialSheetY: number;
  positionHistory: PositionSnapshot[];
  onPointerDown: (event: PointerEvent) => void;
  onPointerMove: (event: PointerEvent) => void;
  onPointerUp: (event: PointerEvent) => void;
  onPointerCancel: (event: PointerEvent) => void;
}

/**
 * Service responsible for handling bottom sheet gesture tracking
 * Handles both touch and mouse events via Pointer Events API
 * Tracks velocity for momentum-based snap decisions
 */
@Injectable({
  providedIn: 'root',
})
export class BottomSheetGestureService {
  private gestureStates = new WeakMap<BottomSheetRef<any, any>, GestureState>();
  private readonly VELOCITY_HISTORY_SIZE = 10;
  private readonly VELOCITY_CALCULATION_WINDOW = 100; // ms

  /**
   * Enables gesture tracking for a bottom sheet
   */
  enableGestures<T = unknown, R = unknown>(
    bottomSheetRef: BottomSheetRef<T, R>,
    dragHandle: HTMLElement,
    onDragStart?: () => void,
    onDragMove?: (deltaY: number, currentY: number) => void,
    onDragEnd?: (velocity: number, deltaY: number) => void
  ): void {
    const overlayElement = bottomSheetRef.overlayRef.overlayElement;

    const onPointerDown = (event: PointerEvent) => {
      if (!event.isPrimary) return;

      const target = event.target as HTMLElement;
      if (!dragHandle.contains(target)) return;

      event.preventDefault();
      event.stopPropagation();

      const state = this.gestureStates.get(bottomSheetRef);
      if (!state || state.isDragging) return;

      state.isDragging = true;
      state.startY = event.clientY;
      state.currentY = event.clientY;
      state.initialSheetY = overlayElement.getBoundingClientRect().top;
      state.positionHistory = [{ y: event.clientY, timestamp: Date.now() }];

      dragHandle.setPointerCapture(event.pointerId);

      document.body.style.userSelect = 'none';
      document.body.style.touchAction = 'none';

      if (onDragStart) {
        onDragStart();
      }
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!event.isPrimary) return;

      const state = this.gestureStates.get(bottomSheetRef);
      if (!state || !state.isDragging) return;

      event.preventDefault();
      event.stopPropagation();

      state.currentY = event.clientY;
      const deltaY = state.currentY - state.startY;

      const now = Date.now();
      state.positionHistory.push({ y: event.clientY, timestamp: now });

      if (state.positionHistory.length > this.VELOCITY_HISTORY_SIZE) {
        state.positionHistory.shift();
      }

      if (onDragMove) {
        onDragMove(deltaY, state.currentY);
      }
    };

    const onPointerUp = (event: PointerEvent) => {
      if (!event.isPrimary) return;

      const state = this.gestureStates.get(bottomSheetRef);
      if (!state || !state.isDragging) return;

      event.preventDefault();
      event.stopPropagation();

      const deltaY = state.currentY - state.startY;
      const velocity = this.calculateVelocity(state.positionHistory);

      state.isDragging = false;
      state.positionHistory = [];

      if (dragHandle.hasPointerCapture(event.pointerId)) {
        dragHandle.releasePointerCapture(event.pointerId);
      }

      document.body.style.userSelect = '';
      document.body.style.touchAction = '';

      if (onDragEnd) {
        onDragEnd(velocity, deltaY);
      }
    };

    const onPointerCancel = (event: PointerEvent) => {
      if (!event.isPrimary) return;

      const state = this.gestureStates.get(bottomSheetRef);
      if (!state || !state.isDragging) return;

      state.isDragging = false;
      state.positionHistory = [];

      if (dragHandle.hasPointerCapture(event.pointerId)) {
        dragHandle.releasePointerCapture(event.pointerId);
      }

      document.body.style.userSelect = '';
      document.body.style.touchAction = '';
    };

    const gestureState: GestureState = {
      isDragging: false,
      startY: 0,
      currentY: 0,
      initialSheetY: 0,
      positionHistory: [],
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel,
    };

    this.gestureStates.set(bottomSheetRef, gestureState);

    dragHandle.addEventListener('pointerdown', onPointerDown);
    dragHandle.addEventListener('pointermove', onPointerMove);
    dragHandle.addEventListener('pointerup', onPointerUp);
    dragHandle.addEventListener('pointercancel', onPointerCancel);
  }

  /**
   * Disables gesture tracking and cleans up event listeners
   */
  disableGestures<T = unknown, R = unknown>(
    bottomSheetRef: BottomSheetRef<T, R>,
    dragHandle: HTMLElement
  ): void {
    const state = this.gestureStates.get(bottomSheetRef);
    if (!state) return;

    dragHandle.removeEventListener('pointerdown', state.onPointerDown);
    dragHandle.removeEventListener('pointermove', state.onPointerMove);
    dragHandle.removeEventListener('pointerup', state.onPointerUp);
    dragHandle.removeEventListener('pointercancel', state.onPointerCancel);

    this.gestureStates.delete(bottomSheetRef);

    document.body.style.userSelect = '';
    document.body.style.touchAction = '';
  }

  /**
   * Calculates velocity from position history
   * Returns pixels per millisecond (positive = downward, negative = upward)
   */
  private calculateVelocity(positionHistory: PositionSnapshot[]): number {
    if (positionHistory.length < 2) {
      return 0;
    }

    const now = positionHistory[positionHistory.length - 1].timestamp;
    const recentPositions = positionHistory.filter(
      (pos) => now - pos.timestamp <= this.VELOCITY_CALCULATION_WINDOW
    );

    if (recentPositions.length < 2) {
      return 0;
    }

    const oldest = recentPositions[0];
    const newest = recentPositions[recentPositions.length - 1];

    const deltaY = newest.y - oldest.y;
    const deltaTime = newest.timestamp - oldest.timestamp;

    if (deltaTime === 0) {
      return 0;
    }

    return deltaY / deltaTime;
  }

  /**
    * Checks if the sheet is currently being dragged
   */
  isDragging<T = unknown, R = unknown>(bottomSheetRef: BottomSheetRef<T, R>): boolean {
    const state = this.gestureStates.get(bottomSheetRef);
    return state?.isDragging ?? false;
  }

  /**
   * Determines if velocity indicates a swipe gesture
   * @param velocity - Velocity in pixels per millisecond
   * @param threshold - Minimum velocity to be considered a swipe (default: 0.5 px/ms)
   * @returns Object with isSwipe flag and direction
   */
  isSwipe(
    velocity: number,
    threshold: number = 0.5
  ): { isSwipe: boolean; direction: 'up' | 'down' | null } {
    const absVelocity = Math.abs(velocity);

    if (absVelocity < threshold) {
      return { isSwipe: false, direction: null };
    }

    return {
      isSwipe: true,
      direction: velocity > 0 ? 'down' : 'up',
    };
  }
}
