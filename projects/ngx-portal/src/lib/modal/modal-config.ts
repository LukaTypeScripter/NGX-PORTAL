
export type CloseReason = 'backdrop' | 'escape' | 'programmatic';

export interface CloseResult<R> {
    reason: CloseReason;
    data?: R;
  }

export interface ModalConfig<T = unknown> {
  data?: T;
  width?: string;
  height?: string;
  panelClass?: string | string[];
  hasBackdrop?: boolean;
  backdropClass?: string;
  disableClose?: boolean;
  ariaLabel?: string;
  ariaLabelledBy?: string;
  ariaDescribedBy?: string;
  role?: 'dialog' | 'alertdialog';
  focusTrap?: boolean;
  animation?: boolean;
  animationDuration?: number;
}
