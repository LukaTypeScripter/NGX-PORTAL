import { Injectable } from '@angular/core';
import { SnapPoint } from '../bottom-sheet-config';

interface ParsedSnapPoint {
  value: number; // in pixels
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
    return snapPoints.map((point, index) => {
      const pixelValue = this.convertToPixels(point, containerHeight);
      return {
        value: pixelValue,
        index,
        originalValue: point,
      };
    }).sort((a, b) => a.value - b.value); 
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
   * Determines the target snap point based on current position and velocity
   * @param currentPosition - Current Y position of the sheet (in pixels from top)
   * @param velocity - Velocity in pixels per millisecond (positive = down, negative = up)
   * @param snapPoints - Parsed snap points
   * @param velocityThreshold - Minimum velocity to trigger momentum snapping (default: 0.5)
   * @returns Target snap point or null if should dismiss
   */
  determineTargetSnapPoint(
    currentPosition: number,
    velocity: number,
    snapPoints: ParsedSnapPoint[],
    velocityThreshold: number = 0.5
  ): ParsedSnapPoint | null {
    if (snapPoints.length === 0) {
      return null;
    }

    const absVelocity = Math.abs(velocity);

    if (absVelocity >= velocityThreshold) {
      if (velocity > 0) {
        return this.getNextLowerSnapPoint(currentPosition, snapPoints);
      } else {
        return this.getNextHigherSnapPoint(currentPosition, snapPoints);
      }
    }

    return this.getNearestSnapPoint(currentPosition, snapPoints);
  }

  /**
   * Gets the nearest snap point to the current position
   */
  private getNearestSnapPoint(
    currentPosition: number,
    snapPoints: ParsedSnapPoint[]
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
   * Returns null if no lower point exists (should dismiss)
   */
  private getNextLowerSnapPoint(
    currentPosition: number,
    snapPoints: ParsedSnapPoint[]
  ): ParsedSnapPoint | null {
    const lowerPoints = snapPoints.filter((point) => point.value > currentPosition);

    if (lowerPoints.length === 0) {
      return null;
    }

    return lowerPoints[0];
  }

  /**
   * Gets the next higher snap point (for upward swipe)
   */
  private getNextHigherSnapPoint(
    currentPosition: number,
    snapPoints: ParsedSnapPoint[]
  ): ParsedSnapPoint {
    const higherPoints = snapPoints.filter((point) => point.value < currentPosition);

    if (higherPoints.length === 0) {
      return snapPoints[0];
    }

    return higherPoints[higherPoints.length - 1];
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
    dismissThreshold: number = 0.3
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
    initialSnapIndex: number = 0
  ): ParsedSnapPoint {
    const index = Math.max(0, Math.min(initialSnapIndex, snapPoints.length - 1));
    return snapPoints[index];
  }

  /**
   * Calculates the position of the sheet based on snap point
   * Returns negative translateY value to pull bottom sheet up into view
   * @param snapPoint - The target snap point
   * @param containerHeight - Viewport height
   */
  calculateSheetPosition(snapPoint: ParsedSnapPoint, containerHeight: number): number {
    // For bottom-positioned sheets, negative values pull the sheet UP
    // snapPoint.value is the desired height from bottom (e.g., 50% = 500px on 1000px viewport)
    // We need to translate UP by (containerHeight - snapPoint.value)
    console.log(containerHeight,"containerHeight",snapPoint.value,"snapPoint.value")
    return containerHeight - snapPoint.value;
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
