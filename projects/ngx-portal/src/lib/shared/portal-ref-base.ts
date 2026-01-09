import { Observable } from 'rxjs';

/**
 * Base class for overlay references (Modal, BottomSheet, etc.)
 * Provides minimal common interface
 */
export abstract class PortalRefBase<T = unknown> {
  abstract close(result?: any): void;
  abstract afterClosed(): Observable<any>;
}
