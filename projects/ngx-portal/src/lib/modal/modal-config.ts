import { Observable } from 'rxjs';
import { PortalConfigBase } from '../shared/portal-config-base';

export type CloseReason = 'backdrop' | 'escape' | 'programmatic';

export interface CloseResult<R> {
  reason: CloseReason;
  data?: R;
}

/**
 * Function that can prevent modal from closing
 * @returns true to allow close, false to prevent close
 */
export type BeforeCloseGuard = () => boolean | Observable<boolean> | Promise<boolean>;

export interface ModalConfig<T = unknown> extends PortalConfigBase<T> {
  dragAndDrop?: boolean;
  width?: string;
  height?: string;
  role?: 'dialog' | 'alertdialog';
  animation?: boolean;
  animationDuration?: number;
  /**
   * Function called before closing the modal
   * Return true to allow close, false to prevent
   * Can be synchronous, Promise, or Observable
   *
   * @example
   * beforeClose: () => confirm('Are you sure?')
   *
   * @example
   * beforeClose: () => this.form.dirty ? confirm('Unsaved changes. Close anyway?') : true
   *
   * @example
   * beforeClose: () => this.http.post('/api/save', data).pipe(map(() => true))
   */
  beforeClose?: BeforeCloseGuard;
}
