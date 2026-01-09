import { PortalConfigBase } from '../shared/portal-config-base';

export type SnapPoint = number | string;

export interface BottomSheetConfig<T = unknown> extends PortalConfigBase<T> {
  snapPoints?: SnapPoint[];
  initialSnapPoint?: number;
  dragHandle?: boolean;
  enableDrag?: boolean;
  dismissOnSwipeDown?: boolean;
  dismissThreshold?: number;
  position?: 'bottom' | 'top';
  swipeVelocityThreshold?: number;
  animation?: boolean;
  animationDuration?: number;
  springConfig?: {
    stiffness: number;
    damping: number;
  };
}
