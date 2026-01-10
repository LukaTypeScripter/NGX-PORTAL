import { Injectable } from '@angular/core';
import { SnapPoint } from '../bottom-sheet-config';

interface ParsedSnapPoint {
  value: number; 
  index: number;
  originalValue: SnapPoint;
}

/**
 * Service responsible for snap point calculations
 * Handles parsing different snap point formats and determining target positions
 */
@Injectable({
  providedIn: 'root',
})
export class BottomSheetSnapService {
  /**
   * Parses snap points and converts them to pixel values
   * Supports: percentages (0.5, "50%"), pixels ("500px"), vh units ("50vh")
   */
  parseSnapPoints(snapPoints: SnapPoint[], containerHeight: number): ParsedSnapPoint[] {
    return snapPoints
      .map((point, index) => {
        const pixelValue = this.convertToPixels(point, containerHeight);
        return {
          value: pixelValue,
          index,
          originalValue: point,
        };
      })
      .sort((a, b) => a.value - b.value);
  }

  /**
   * Converts a snap point to pixel value
   */
  private convertToPixels(point: SnapPoint, containerHeight: number): number {
    if (typeof point === 'number') {
      if (point <= 1) {
        return containerHeight * point;
      }
      return point;
    }

    if (typeof point === 'string') {
      if (point.endsWith('%')) {
        const percentage = parseFloat(point) / 100;
        return containerHeight * percentage;
      }

      if (point.endsWith('px')) {
        return parseFloat(point);
      }

      if (point.endsWith('vh')) {
        const vh = parseFloat(point) / 100;
        return window.innerHeight * vh;
      }

      const parsed = parseFloat(point);
      if (!isNaN(parsed)) {
        return parsed <= 1 ? containerHeight * parsed : parsed;
      }
    }

    return containerHeight * 0.5;
  }

  /**
   * Determines the target snap point based on current visible height and velocity
   * @param currentVisibleHeight - Current visible height from bottom (in pixels)
   * @param velocity - Velocity in pixels per millisecond (positive = down, negative = up)
   * @param snapPoints - Parsed snap points (values represent visible height from bottom)
   * @param velocityThreshold - Minimum velocity to trigger momentum snapping (default: 0.5)
   * @returns Target snap point or null if should dismiss
   */
  determineTargetSnapPoint(
    currentVisibleHeight: number,
    velocity: number,
    snapPoints: ParsedSnapPoint[],
    velocityThreshold: number = 0.5,
  ): ParsedSnapPoint | null {
    if (snapPoints.length === 0) {
      return null;
    }

    const absVelocity = Math.abs(velocity);

    if (absVelocity >= velocityThreshold) {
      if (velocity > 0) {
        return this.getNextLowerSnapPoint(currentVisibleHeight, snapPoints);
      } else {
        return this.getNextHigherSnapPoint(currentVisibleHeight, snapPoints);
      }
    }

    return this.getNearestSnapPoint(currentVisibleHeight, snapPoints);
  }

  /**
   * Gets the nearest snap point to the current position
   */
  private getNearestSnapPoint(
    currentPosition: number,
    snapPoints: ParsedSnapPoint[],
  ): ParsedSnapPoint {
    let nearest = snapPoints[0];
    let minDistance = Math.abs(currentPosition - snapPoints[0].value);

    for (let i = 1; i < snapPoints.length; i++) {
      const distance = Math.abs(currentPosition - snapPoints[i].value);
      if (distance < minDistance) {
        minDistance = distance;
        nearest = snapPoints[i];
      }
    }

    return nearest;
  }

  /**
   * Gets the next lower snap point (for downward swipe)
   * "Lower" means less visible height (smaller value)
   * Returns null if no lower point exists (should dismiss)
   */
  private getNextLowerSnapPoint(
    currentVisibleHeight: number,
    snapPoints: ParsedSnapPoint[],
  ): ParsedSnapPoint | null {
    const lowerPoints = snapPoints.filter((point) => point.value < currentVisibleHeight);

    if (lowerPoints.length === 0) {
      return null;
    }

    return lowerPoints[lowerPoints.length - 1];
  }

  /**
   * Gets the next higher snap point (for upward swipe)
   * "Higher" means more visible height (larger value)
   */
  private getNextHigherSnapPoint(
    currentVisibleHeight: number,
    snapPoints: ParsedSnapPoint[],
  ): ParsedSnapPoint {
    const higherPoints = snapPoints.filter((point) => point.value > currentVisibleHeight);

    if (higherPoints.length === 0) {
      return snapPoints[snapPoints.length - 1];
    }

    return higherPoints[0];
  }

  /**
   * Checks if the sheet should be dismissed based on position and threshold
   * @param currentPosition - Current Y position
   * @param containerHeight - Total height of viewport
   * @param dismissThreshold - Percentage of screen dragged down to dismiss (default: 0.3)
   */
  shouldDismiss(
    currentPosition: number,
    containerHeight: number,
    dismissThreshold: number = 0.3,
  ): boolean {
    const draggedDistance = currentPosition;
    const threshold = containerHeight * dismissThreshold;
    return draggedDistance >= threshold;
  }

  /**
   * Calculates the initial snap point position
   * @param snapPoints - Parsed snap points
   * @param initialSnapIndex - Index of the initial snap point (default: 0)
   */
  getInitialSnapPoint(
    snapPoints: ParsedSnapPoint[],
    initialSnapIndex: number = 0,
  ): ParsedSnapPoint {
    const index = Math.max(0, Math.min(initialSnapIndex, snapPoints.length - 1));
    return snapPoints[index];
  }

  /**
   * Calculates the translateY value to position the sheet at a snap point
   * @param snapPoint - The target snap point
   * @param containerHeight - Viewport height
   * @param sheetHeight - Actual height of the bottom sheet element
   */
  calculateSheetPosition(snapPoint: ParsedSnapPoint, sheetHeight: number): number {
    return Math.max(0, sheetHeight - snapPoint.value);
  }

  /**
   * Gets snap point by index
   */
  getSnapPointByIndex(snapPoints: ParsedSnapPoint[], index: number): ParsedSnapPoint | null {
    if (index < 0 || index >= snapPoints.length) {
      return null;
    }
    return snapPoints[index];
  }

  /**
   * Validates snap points
   * Returns true if snap points are valid
   */
  validateSnapPoints(snapPoints: SnapPoint[]): boolean {
    if (!snapPoints || snapPoints.length === 0) {
      return false;
    }

    for (const point of snapPoints) {
      if (typeof point === 'number') {
        if (point < 0) {
          return false;
        }
      } else if (typeof point === 'string') {
        if (!point.match(/^(\d+\.?\d*)(px|%|vh)?$/)) {
          return false;
        }
      } else {
        return false;
      }
    }

    return true;
  }

  /**
   * Gets the snap point at a specific percentage of viewport height
   */
  getSnapPointAtPercentage(percentage: number, containerHeight: number): number {
    return containerHeight * Math.max(0, Math.min(1, percentage));
  }
}
