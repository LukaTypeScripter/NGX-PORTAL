export interface PortalConfigBase<T = unknown> {
  data?: T;
  hasBackdrop?: boolean;
  backdropClass?: string;
  disableClose?: boolean;
  ariaLabel?: string;
  ariaLabelledBy?: string;
  ariaDescribedBy?: string;
  panelClass?: string | string[];
  focusTrap?: boolean;
}
