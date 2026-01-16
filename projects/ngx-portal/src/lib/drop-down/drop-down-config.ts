import { PortalConfigBase } from "../shared/portal-config-base";


export interface DropDownConfig<T = unknown> extends PortalConfigBase<T> {
  position?: 'top' | 'bottom';
  yOffset?: number;
  xOffset?: number;
  autoClose?: boolean;
  autoCloseDelay?: number;
  autoCloseOnClickOutside?: boolean;
  autoCloseOnEscape?: boolean;
  autoCloseOnResize?: boolean;
  autoCloseOnScroll?: boolean;
  width?: string;
  height?: string;
  animation?: boolean;
  animationDuration?: number;
  springConfig?: {
    stiffness: number;
    damping: number;
  };
}