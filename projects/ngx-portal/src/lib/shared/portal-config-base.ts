export interface PortalConfigBase<T = unknown> {
  // Shared config properties for Modal and BottomSheet
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
